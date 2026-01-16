import express from "express";

const VITE_TAWKTO_PROPERTY_ID = process.env.VITE_TAWKTO_PROPERTY_ID!;
const VITE_TAWKTO_WIDGET_NAME = process.env.VITE_TAWKTO_WIDGET_NAME!;

const router = express.Router();

router.post("/get-tawkto-credentials", (req, res) => {
    const propertyId = VITE_TAWKTO_PROPERTY_ID;
    const widgetName = VITE_TAWKTO_WIDGET_NAME;
    if (!propertyId || !widgetName) {
        res
            .status(500)
            .json({
                error: "Tawk.to credentials not found in environment variables"
            });
        return;
    }
    res.json({ propertyId, widgetName });
});

export default router;