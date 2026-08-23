import type { Metadata } from "next";
import BookingDemo from "../BookingDemo";

export const metadata: Metadata = { title: "Improved Booking Flow | SpaPlus", robots: { index: false, follow: false } };

export default function ImprovedBookingPage() { return <BookingDemo mode="improved" />; }
