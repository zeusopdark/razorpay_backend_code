import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    razorpay_order_id: {
        type: String,
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_signature_id: {
        type: String,
        required: true,
    },
})
const paymentModel = mongoose.model("RazorpayPayement", paymentSchema);
export default paymentModel;