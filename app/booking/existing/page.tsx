import type { Metadata } from "next";
import BookingDemo from "../BookingDemo";

export const metadata: Metadata = { title: "Existing Booking Flow | SpaPlus", robots: { index: false, follow: false } };

export default function ExistingBookingPage() { return <BookingDemo mode="existing" />; }
