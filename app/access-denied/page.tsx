export default function AccessDeniedPage() {
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,textAlign:"center"}} dir="rtl">
      <div>
        <h1>אין הרשאה למערכת הניהול</h1>
        <p>החשבון מחובר, אך עדיין לא נוסף לרשימת המשתמשים המורשים.</p>
        <a href="/">חזרה לאתר</a>
      </div>
    </main>
  );
}
