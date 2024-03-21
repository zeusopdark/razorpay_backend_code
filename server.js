import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import paymentModel from "./model/paymentSchema.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const instance = new Razorpay({
    key_id: process.env.ID,
    key_secret: process.env.KEY_SECRET
});

app.post("/checkout", async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR",
        };
        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error in /checkout:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


app.post("/paymentVerification", async (req, res) => {
    try {
        console.log("Payment Verification Body:", req.body);

        const { razorpay_order_id, razorpay_signature, razorpay_payment_id } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.KEY_SECRET).update(body.toString()).digest('hex');
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            await paymentModel.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature_id: razorpay_signature
            });
            res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
        } else {
            res.status(400).json({ success: false, error: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Error in /paymentVerification:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Get Razorpay Key
app.get("/api/getkey", (req, res) => {
    try {
        res.status(200).json({ key: process.env.ID });
    } catch (error) {
        console.error("Error in /api/getkey:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Connect to MongoDB and Start Server
mongoose.connect(process.env.URL);
mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
        console.log(`Listening on PORT ${process.env.PORT}`);
    });
});
mongoose.connection.on('error', (err) => {
    console.error("MongoDB Connection Error:", err);
});
