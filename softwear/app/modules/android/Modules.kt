// `<zoom-image>` on Android: a product photo that pinches to zoom, pans while zoomed, and double-taps in and out.
//
//   props   source   the photo, a path under the app's assets (`assets/p/<file>`)
//   events  load     once the photo is up
//           message  "dismiss" when the person pulls the photo down at its resting size
package exact.app

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RectF
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.View
import dev.exact.canvas.NativeModule
import dev.exact.canvas.NativeModules
import org.json.JSONObject
import kotlin.math.max
import kotlin.math.min

class Modules : NativeModules {
    override val modules: Map<String, NativeModule> = mapOf("zoom-image" to ZoomImageModule())
}

private class ZoomImageModule : NativeModule {
    override fun create(context: Context, props: JSONObject): View = ZoomImageView(context).also { update(it, props) }
    override fun update(view: View, props: JSONObject) { (view as ZoomImageView).source(props.optString("source", "")) }
    override fun events(view: View, emit: (String, String) -> Unit) { (view as ZoomImageView).emit = emit }
    override fun destroy(view: View) { (view as ZoomImageView).recycle() }
}

/** The photo drawn through one matrix: fitted and centred at 1×, zoomed about the fingers up to 4×, and held
 * inside the view while larger than it. */
private class ZoomImageView(context: Context) : View(context) {
    var emit: ((String, String) -> Unit)? = null
    private var bitmap: Bitmap? = null
    private var source = ""
    private val matrix = Matrix()
    private val paint = Paint(Paint.FILTER_BITMAP_FLAG)
    private var scale = 1f
    private var pull = 0f
    private var pulling = false
    private val values = FloatArray(9)
    private val maxScale = 4f

    private val scaler = ScaleGestureDetector(context, object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
        override fun onScale(d: ScaleGestureDetector): Boolean {
            zoomBy(d.scaleFactor, d.focusX, d.focusY)
            return true
        }
    })
    private val gestures = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {
        override fun onDown(e: MotionEvent): Boolean = true
        override fun onScroll(e1: MotionEvent?, e2: MotionEvent, dx: Float, dy: Float): Boolean {
            if (scaler.isInProgress) return false
            if (scale > 1.001f) { matrix.postTranslate(-dx, -dy); hold(); invalidate() }
            else { pulling = true; pull = max(0f, pull - dy); invalidate() }
            return true
        }
        override fun onDoubleTap(e: MotionEvent): Boolean {
            if (scale > 1.001f) reset() else zoomBy(2.5f, e.x, e.y)
            return true
        }
    })

    fun source(next: String) {
        if (next == source) return
        source = next
        bitmap?.recycle()
        bitmap = try { context.assets.open("app/$next").use { BitmapFactory.decodeStream(it) } } catch (e: Exception) { null }
        reset()
        if (bitmap != null) emit?.invoke("load", "")
    }

    fun recycle() { bitmap?.recycle(); bitmap = null }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) { reset() }

    /** The photo fitted into the view and centred, at 1×. */
    private fun reset() {
        val b = bitmap ?: return
        if (width == 0 || height == 0) return
        val fit = min(width / b.width.toFloat(), height / b.height.toFloat())
        matrix.reset()
        matrix.postScale(fit, fit)
        matrix.postTranslate((width - b.width * fit) / 2, (height - b.height * fit) / 2)
        scale = 1f
        invalidate()
    }

    private fun zoomBy(factor: Float, x: Float, y: Float) {
        val next = min(maxScale, max(1f, scale * factor))
        val by = next / scale
        matrix.postScale(by, by, x, y)
        scale = next
        hold()
        invalidate()
    }

    /** Keeps the zoomed photo inside the view: centred on an axis it does not fill, edge to edge on one it does. */
    private fun hold() {
        val b = bitmap ?: return
        val rect = RectF(0f, 0f, b.width.toFloat(), b.height.toFloat())
        matrix.mapRect(rect)
        var dx = 0f
        var dy = 0f
        if (rect.width() <= width) dx = (width - rect.width()) / 2 - rect.left
        else if (rect.left > 0) dx = -rect.left
        else if (rect.right < width) dx = width - rect.right
        if (rect.height() <= height) dy = (height - rect.height()) / 2 - rect.top
        else if (rect.top > 0) dy = -rect.top
        else if (rect.bottom < height) dy = height - rect.bottom
        matrix.postTranslate(dx, dy)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        scaler.onTouchEvent(event)
        gestures.onTouchEvent(event)
        if (event.actionMasked == MotionEvent.ACTION_UP || event.actionMasked == MotionEvent.ACTION_CANCEL) {
            if (pulling) {
                pulling = false
                val out = event.actionMasked == MotionEvent.ACTION_UP && scale <= 1.001f && pull > 90 * resources.displayMetrics.density
                pull = 0f
                invalidate()
                if (out) emit?.invoke("message", "dismiss")
            }
        }
        return true
    }

    override fun onDraw(canvas: Canvas) {
        val b = bitmap ?: return
        canvas.save()
        if (pull > 0f) canvas.translate(0f, pull * 0.6f)
        canvas.drawBitmap(b, matrix, paint)
        canvas.restore()
    }
}
