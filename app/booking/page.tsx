import type { Metadata } from "next";
import Link from "next/link";
import "./booking.css";

export const metadata: Metadata = { title: "Booking Flow Demo | SpaPlus", robots: { index: false, follow: false } };

export default function BookingLanding() {
  return <main className="booking-demo"><div className="booking-shell"><div className="booking-intro"><span className="booking-demo-pill">Interactive prototype</span><h1>SpaPlus booking flows</h1><p>Compare the current booking journey with the proposed mobile-first experience. Both demonstrations include solo treatment and solo package flows through card verification.</p></div><div className="booking-product-grid"><Link className="booking-product booking-landing-link" href="/booking/existing"><div className="booking-product-copy"><small>Current experience</small><h2>Existing booking flow</h2><p>See the longer, repeated journey reproduced as an interactive demonstration.</p></div><span className="booking-product-cta">Open existing flow</span></Link><Link className="booking-product booking-landing-link" href="/booking/improved"><div className="booking-product-copy"><small>Recommended experience</small><h2>Improved booking flow</h2><p>See the shorter progressive journey with clearer choices and fewer visible fields.</p></div><span className="booking-product-cta">Open improved flow</span></Link></div><footer className="booking-footer"><p>Interactive concept only. No booking, login, payment or personal data is submitted.</p></footer></div></main>;
}
