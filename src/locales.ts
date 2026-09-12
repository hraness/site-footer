/**
 * Canonical copy for the shared mailing-signup surface only.
 * See docs/localization.md for evidence, register choices and fallback rules.
 * These are reviewed-as-code translation drafts, not native-speaker validation.
 */
export type FooterCopyStyle = "direct" | "inviting";

export type FooterMessages = Readonly<{
  button: string;
  placeholder: string;
  emailLabel: string;
  formLabel: string;
  pending: string;
  submitting: string;
  verifying: string;
  retryVerification: string;
  verificationError: string;
  requestError: string;
  accepted: string;
  openLabel: string;
  closeLabel: string;
  invalidEmail: string;
}>;

export type FooterLocale = Readonly<{
  locale: string;
  dir: "ltr" | "rtl";
  styles: Readonly<Record<FooterCopyStyle, FooterMessages>>;
}>;

type SharedMessages = Omit<FooterMessages, "button" | "placeholder" | "emailLabel">;

const sharedMessages = {
  "en": {
    "formLabel": "Subscribe by email",
    "verifying": "Verifying…",
    "retryVerification": "Retry check",
    "verificationError": "Security check failed. Try again.",
    "pending": "Subscribing…",
    "submitting": "Submitting your email…",
    "requestError": "Couldn't subscribe. Try again.",
    "accepted": "Check your email to confirm",
    "openLabel": "Subscribe by email",
    "closeLabel": "Close email signup",
    "invalidEmail": "Enter a valid email address."
  },
  "es": {
    "formLabel": "Recibir novedades por correo",
    "verifying": "Verificando…",
    "retryVerification": "Reintentar verificación",
    "verificationError": "Falló la verificación de seguridad. Inténtalo de nuevo.",
    "pending": "Enviando…",
    "submitting": "Enviando…",
    "requestError": "Algo salió mal. Inténtalo de nuevo.",
    "accepted": "Solicitud recibida. Revisa tu correo para continuar.",
    "openLabel": "Recibir novedades por correo",
    "closeLabel": "Cerrar",
    "invalidEmail": "Escribe un correo electrónico válido."
  },
  "es-AR": {
    "formLabel": "Recibir novedades por correo",
    "verifying": "Verificando…",
    "retryVerification": "Reintentar verificación",
    "verificationError": "Falló la verificación de seguridad. Intentá de nuevo.",
    "pending": "Enviando…",
    "submitting": "Enviando…",
    "requestError": "Algo salió mal. Intentá de nuevo.",
    "accepted": "Recibimos tu solicitud. Revisá tu correo para continuar.",
    "openLabel": "Recibir novedades por correo",
    "closeLabel": "Cerrar",
    "invalidEmail": "Escribí un correo electrónico válido."
  },
  "fr": {
    "formLabel": "Recevoir les nouveautés par e-mail",
    "verifying": "Vérification…",
    "retryVerification": "Relancer la vérification",
    "verificationError": "La vérification de sécurité a échoué. Réessayez.",
    "pending": "Envoi…",
    "submitting": "Envoi…",
    "requestError": "Un problème est survenu. Réessayez.",
    "accepted": "Demande reçue. Consultez votre e-mail pour la suite.",
    "openLabel": "Recevoir les nouveautés par e-mail",
    "closeLabel": "Fermer",
    "invalidEmail": "Saisissez une adresse e-mail valide."
  },
  "fr-CA": {
    "formLabel": "Recevoir les nouvelles par courriel",
    "verifying": "Vérification…",
    "retryVerification": "Relancer la vérification",
    "verificationError": "La vérification de sécurité a échoué. Réessayez.",
    "pending": "Envoi…",
    "submitting": "Envoi…",
    "requestError": "Un problème est survenu. Réessayez.",
    "accepted": "Demande reçue. Consultez votre courriel pour la suite.",
    "openLabel": "Recevoir les nouvelles par courriel",
    "closeLabel": "Fermer",
    "invalidEmail": "Saisissez une adresse courriel valide."
  },
  "pt-BR": {
    "formLabel": "Receber novidades por e-mail",
    "verifying": "Verificando…",
    "retryVerification": "Tentar verificação de novo",
    "verificationError": "A verificação de segurança falhou. Tente novamente.",
    "pending": "Enviando…",
    "submitting": "Enviando…",
    "requestError": "Algo deu errado. Tente novamente.",
    "accepted": "Recebemos seu pedido. Confira seu e-mail para continuar.",
    "openLabel": "Receber novidades por e-mail",
    "closeLabel": "Fechar",
    "invalidEmail": "Digite um e-mail válido."
  },
  "pt-PT": {
    "formLabel": "Receber novidades por e-mail",
    "verifying": "A verificar…",
    "retryVerification": "Repetir verificação",
    "verificationError": "A verificação de segurança falhou. Tente novamente.",
    "pending": "A enviar…",
    "submitting": "A enviar…",
    "requestError": "Ocorreu um erro. Tente novamente.",
    "accepted": "Pedido recebido. Consulte o seu e-mail para continuar.",
    "openLabel": "Receber novidades por e-mail",
    "closeLabel": "Fechar",
    "invalidEmail": "Introduza um e-mail válido."
  },
  "de": {
    "formLabel": "Neuigkeiten per E-Mail abonnieren",
    "verifying": "Wird überprüft…",
    "retryVerification": "Prüfung wiederholen",
    "verificationError": "Die Sicherheitsprüfung ist fehlgeschlagen. Versuch es noch einmal.",
    "pending": "Wird gesendet…",
    "submitting": "Wird gesendet…",
    "requestError": "Etwas ist schiefgelaufen. Versuch es noch einmal.",
    "accepted": "Anfrage erhalten. Schau für den nächsten Schritt in deine E-Mails.",
    "openLabel": "Neuigkeiten per E-Mail abonnieren",
    "closeLabel": "Schließen",
    "invalidEmail": "Gib eine gültige E-Mail-Adresse ein."
  },
  "nl": {
    "formLabel": "Nieuws ontvangen per e-mail",
    "verifying": "Controleren…",
    "retryVerification": "Controle opnieuw proberen",
    "verificationError": "De veiligheidscontrole is mislukt. Probeer het opnieuw.",
    "pending": "Verzenden…",
    "submitting": "Verzenden…",
    "requestError": "Er ging iets mis. Probeer het opnieuw.",
    "accepted": "Aanvraag ontvangen. Bekijk je e-mail voor de volgende stap.",
    "openLabel": "Nieuws ontvangen per e-mail",
    "closeLabel": "Sluiten",
    "invalidEmail": "Vul een geldig e-mailadres in."
  },
  "it": {
    "formLabel": "Ricevere le novità via email",
    "verifying": "Verifica…",
    "retryVerification": "Ripeti la verifica",
    "verificationError": "La verifica di sicurezza non è riuscita. Riprova.",
    "pending": "Invio…",
    "submitting": "Invio…",
    "requestError": "Qualcosa è andato storto. Riprova.",
    "accepted": "Richiesta ricevuta. Controlla la tua email per continuare.",
    "openLabel": "Ricevere le novità via email",
    "closeLabel": "Chiudi",
    "invalidEmail": "Inserisci un indirizzo email valido."
  },
  "ca": {
    "formLabel": "Rebre novetats per correu",
    "verifying": "Verificant…",
    "retryVerification": "Torna a verificar",
    "verificationError": "La verificació de seguretat ha fallat. Torna-ho a provar.",
    "pending": "Enviant…",
    "submitting": "Enviant…",
    "requestError": "Hi ha hagut un problema. Torna-ho a provar.",
    "accepted": "Hem rebut la sol·licitud. Revisa el correu per continuar.",
    "openLabel": "Rebre novetats per correu",
    "closeLabel": "Tanca",
    "invalidEmail": "Introdueix un correu electrònic vàlid."
  },
  "sv": {
    "formLabel": "Prenumerera på nyheter via e-post",
    "verifying": "Verifierar…",
    "retryVerification": "Försök verifiera igen",
    "verificationError": "Säkerhetskontrollen misslyckades. Försök igen.",
    "pending": "Skickar…",
    "submitting": "Skickar…",
    "requestError": "Något gick fel. Försök igen.",
    "accepted": "Förfrågan mottagen. Kolla din e-post för nästa steg.",
    "openLabel": "Prenumerera på nyheter via e-post",
    "closeLabel": "Stäng",
    "invalidEmail": "Ange en giltig e-postadress."
  },
  "da": {
    "formLabel": "Tilmeld dig nyheder via e-mail",
    "verifying": "Bekræfter…",
    "retryVerification": "Prøv kontrollen igen",
    "verificationError": "Sikkerhedskontrollen mislykkedes. Prøv igen.",
    "pending": "Sender…",
    "submitting": "Sender…",
    "requestError": "Noget gik galt. Prøv igen.",
    "accepted": "Anmodning modtaget. Tjek din e-mail for næste trin.",
    "openLabel": "Tilmeld dig nyheder via e-mail",
    "closeLabel": "Luk",
    "invalidEmail": "Indtast en gyldig e-mailadresse."
  },
  "nb": {
    "formLabel": "Abonner på nyheter via e-post",
    "verifying": "Bekrefter…",
    "retryVerification": "Prøv kontrollen igjen",
    "verificationError": "Sikkerhetskontrollen mislyktes. Prøv igjen.",
    "pending": "Sender…",
    "submitting": "Sender…",
    "requestError": "Noe gikk galt. Prøv igjen.",
    "accepted": "Forespørselen er mottatt. Sjekk e-posten din for neste steg.",
    "openLabel": "Abonner på nyheter via e-post",
    "closeLabel": "Lukk",
    "invalidEmail": "Skriv inn en gyldig e-postadresse."
  },
  "fi": {
    "formLabel": "Tilaa uutiset sähköpostitse",
    "verifying": "Vahvistetaan…",
    "retryVerification": "Yritä tarkistusta uudelleen",
    "verificationError": "Turvatarkistus epäonnistui. Yritä uudelleen.",
    "pending": "Lähetetään…",
    "submitting": "Lähetetään…",
    "requestError": "Jokin meni pieleen. Yritä uudelleen.",
    "accepted": "Pyyntö vastaanotettu. Tarkista sähköpostistasi seuraava vaihe.",
    "openLabel": "Tilaa uutiset sähköpostitse",
    "closeLabel": "Sulje",
    "invalidEmail": "Anna kelvollinen sähköpostiosoite."
  },
  "pl": {
    "formLabel": "Otrzymuj nowości e-mailem",
    "verifying": "Weryfikacja…",
    "retryVerification": "Ponów weryfikację",
    "verificationError": "Weryfikacja bezpieczeństwa nie powiodła się. Spróbuj ponownie.",
    "pending": "Wysyłanie…",
    "submitting": "Wysyłanie…",
    "requestError": "Coś poszło nie tak. Spróbuj ponownie.",
    "accepted": "Zgłoszenie otrzymane. Sprawdź e-mail, aby kontynuować.",
    "openLabel": "Otrzymuj nowości e-mailem",
    "closeLabel": "Zamknij",
    "invalidEmail": "Wpisz poprawny adres e-mail."
  },
  "cs": {
    "formLabel": "Odebírat novinky e-mailem",
    "verifying": "Ověřování…",
    "retryVerification": "Zopakovat ověření",
    "verificationError": "Bezpečnostní ověření selhalo. Zkus to znovu.",
    "pending": "Odesílání…",
    "submitting": "Odesílání…",
    "requestError": "Něco se nepovedlo. Zkus to znovu.",
    "accepted": "Požadavek přijat. Další krok najdeš v e-mailu.",
    "openLabel": "Odebírat novinky e-mailem",
    "closeLabel": "Zavřít",
    "invalidEmail": "Zadej platnou e-mailovou adresu."
  },
  "sk": {
    "formLabel": "Odoberať novinky e-mailom",
    "verifying": "Overovanie…",
    "retryVerification": "Zopakovať overenie",
    "verificationError": "Bezpečnostné overenie zlyhalo. Skús to znova.",
    "pending": "Odosielanie…",
    "submitting": "Odosielanie…",
    "requestError": "Niečo sa nepodarilo. Skús to znova.",
    "accepted": "Žiadosť prijatá. Ďalší krok nájdeš v e-maile.",
    "openLabel": "Odoberať novinky e-mailom",
    "closeLabel": "Zavrieť",
    "invalidEmail": "Zadaj platnú e-mailovú adresu."
  },
  "hu": {
    "formLabel": "Feliratkozás e-mailes hírekre",
    "verifying": "Ellenőrzés…",
    "retryVerification": "Ellenőrzés újra",
    "verificationError": "A biztonsági ellenőrzés sikertelen. Próbáld újra.",
    "pending": "Küldés…",
    "submitting": "Küldés…",
    "requestError": "Valami hiba történt. Próbáld újra.",
    "accepted": "Kérés fogadva. A következő lépésért nézd meg az e-mailjeidet.",
    "openLabel": "Feliratkozás e-mailes hírekre",
    "closeLabel": "Bezárás",
    "invalidEmail": "Adj meg egy érvényes e-mail-címet."
  },
  "ro": {
    "formLabel": "Primește noutăți prin e-mail",
    "verifying": "Se verifică…",
    "retryVerification": "Repetă verificarea",
    "verificationError": "Verificarea de securitate a eșuat. Încearcă din nou.",
    "pending": "Se trimite…",
    "submitting": "Se trimite…",
    "requestError": "Ceva nu a mers bine. Încearcă din nou.",
    "accepted": "Cerere primită. Verifică e-mailul pentru a continua.",
    "openLabel": "Primește noutăți prin e-mail",
    "closeLabel": "Închide",
    "invalidEmail": "Introdu o adresă de e-mail validă."
  },
  "el": {
    "formLabel": "Εγγραφή για νέα μέσω email",
    "verifying": "Επαλήθευση…",
    "retryVerification": "Επανάληψη ελέγχου",
    "verificationError": "Ο έλεγχος ασφαλείας απέτυχε. Δοκίμασε ξανά.",
    "pending": "Αποστολή…",
    "submitting": "Αποστολή…",
    "requestError": "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
    "accepted": "Το αίτημα ελήφθη. Έλεγξε το email σου για το επόμενο βήμα.",
    "openLabel": "Εγγραφή για νέα μέσω email",
    "closeLabel": "Κλείσιμο",
    "invalidEmail": "Συμπλήρωσε μια έγκυρη διεύθυνση email."
  },
  "bg": {
    "formLabel": "Абониране за новини по имейл",
    "verifying": "Проверка…",
    "retryVerification": "Повтори проверката",
    "verificationError": "Проверката за сигурност е неуспешна. Опитай отново.",
    "pending": "Изпращане…",
    "submitting": "Изпращане…",
    "requestError": "Възникна проблем. Опитай отново.",
    "accepted": "Заявката е получена. Провери имейла си за следващата стъпка.",
    "openLabel": "Абониране за новини по имейл",
    "closeLabel": "Затвори",
    "invalidEmail": "Въведи валиден имейл адрес."
  },
  "hr": {
    "formLabel": "Primaj novosti e-poštom",
    "verifying": "Provjera…",
    "retryVerification": "Ponovi provjeru",
    "verificationError": "Sigurnosna provjera nije uspjela. Pokušaj ponovno.",
    "pending": "Slanje…",
    "submitting": "Slanje…",
    "requestError": "Nešto je pošlo po zlu. Pokušaj ponovno.",
    "accepted": "Zahtjev je primljen. Provjeri e-poštu za sljedeći korak.",
    "openLabel": "Primaj novosti e-poštom",
    "closeLabel": "Zatvori",
    "invalidEmail": "Unesi valjanu e-adresu."
  },
  "sl": {
    "formLabel": "Prejemaj novosti po e-pošti",
    "verifying": "Preverjanje…",
    "retryVerification": "Ponovi preverjanje",
    "verificationError": "Varnostno preverjanje ni uspelo. Poskusi znova.",
    "pending": "Pošiljanje…",
    "submitting": "Pošiljanje…",
    "requestError": "Prišlo je do napake. Poskusi znova.",
    "accepted": "Zahteva je prejeta. Preveri e-pošto za naslednji korak.",
    "openLabel": "Prejemaj novosti po e-pošti",
    "closeLabel": "Zapri",
    "invalidEmail": "Vnesi veljaven e-naslov."
  },
  "sr-Latn": {
    "formLabel": "Primaj novosti imejlom",
    "verifying": "Provera…",
    "retryVerification": "Ponovi proveru",
    "verificationError": "Bezbednosna provera nije uspela. Pokušaj ponovo.",
    "pending": "Slanje…",
    "submitting": "Slanje…",
    "requestError": "Nešto nije u redu. Pokušaj ponovo.",
    "accepted": "Zahtev je primljen. Proveri imejl za sledeći korak.",
    "openLabel": "Primaj novosti imejlom",
    "closeLabel": "Zatvori",
    "invalidEmail": "Unesi važeću imejl adresu."
  },
  "sr-Cyrl": {
    "formLabel": "Примај новости имејлом",
    "verifying": "Провера…",
    "retryVerification": "Понови проверу",
    "verificationError": "Безбедносна провера није успела. Покушај поново.",
    "pending": "Слање…",
    "submitting": "Слање…",
    "requestError": "Нешто није у реду. Покушај поново.",
    "accepted": "Захтев је примљен. Провери имејл за следећи корак.",
    "openLabel": "Примај новости имејлом",
    "closeLabel": "Затвори",
    "invalidEmail": "Унеси важећу имејл адресу."
  },
  "uk": {
    "formLabel": "Підписатися на новини електронною поштою",
    "verifying": "Перевірка…",
    "retryVerification": "Повторити перевірку",
    "verificationError": "Перевірка безпеки не вдалася. Спробуй ще раз.",
    "pending": "Надсилання…",
    "submitting": "Надсилання…",
    "requestError": "Щось пішло не так. Спробуй ще раз.",
    "accepted": "Запит отримано. Перевір пошту для наступного кроку.",
    "openLabel": "Підписатися на новини електронною поштою",
    "closeLabel": "Закрити",
    "invalidEmail": "Введи дійсну електронну адресу."
  },
  "ru": {
    "formLabel": "Подписаться на новости по электронной почте",
    "verifying": "Проверка…",
    "retryVerification": "Повторить проверку",
    "verificationError": "Проверка безопасности не пройдена. Попробуй ещё раз.",
    "pending": "Отправка…",
    "submitting": "Отправка…",
    "requestError": "Что-то пошло не так. Попробуй ещё раз.",
    "accepted": "Запрос получен. Проверь почту для следующего шага.",
    "openLabel": "Подписаться на новости по электронной почте",
    "closeLabel": "Закрыть",
    "invalidEmail": "Введи корректный адрес электронной почты."
  },
  "tr": {
    "formLabel": "E-postayla haberlere abone ol",
    "verifying": "Doğrulanıyor…",
    "retryVerification": "Kontrolü yeniden dene",
    "verificationError": "Güvenlik kontrolü başarısız oldu. Tekrar dene.",
    "pending": "Gönderiliyor…",
    "submitting": "Gönderiliyor…",
    "requestError": "Bir sorun oluştu. Lütfen tekrar dene.",
    "accepted": "İsteğin alındı. Sonraki adım için e-postanı kontrol et.",
    "openLabel": "E-postayla haberlere abone ol",
    "closeLabel": "Kapat",
    "invalidEmail": "Geçerli bir e-posta adresi gir."
  },
  "ar": {
    "formLabel": "الاشتراك في الأخبار بالبريد الإلكتروني",
    "verifying": "جارٍ التحقق…",
    "retryVerification": "إعادة التحقق",
    "verificationError": "فشل التحقق الأمني. حاول مرة أخرى.",
    "pending": "جارٍ الإرسال…",
    "submitting": "جارٍ الإرسال…",
    "requestError": "حدث خطأ. حاول مرة أخرى.",
    "accepted": "تم استلام الطلب. راجع بريدك الإلكتروني للخطوة التالية.",
    "openLabel": "الاشتراك في الأخبار بالبريد الإلكتروني",
    "closeLabel": "إغلاق",
    "invalidEmail": "أدخل عنوان بريد إلكتروني صالحًا."
  },
  "he": {
    "formLabel": "הרשמה לעדכונים באימייל",
    "verifying": "מתבצע אימות…",
    "retryVerification": "ניסיון אימות נוסף",
    "verificationError": "בדיקת האבטחה נכשלה. כדאי לנסות שוב.",
    "pending": "שולח…",
    "submitting": "שולח…",
    "requestError": "משהו השתבש. כדאי לנסות שוב.",
    "accepted": "הבקשה התקבלה. השלב הבא נמצא באימייל שלך.",
    "openLabel": "הרשמה לעדכונים באימייל",
    "closeLabel": "סגירה",
    "invalidEmail": "יש להזין כתובת אימייל תקינה."
  },
  "fa": {
    "formLabel": "دریافت خبرها با ایمیل",
    "verifying": "در حال بررسی…",
    "retryVerification": "بررسی دوباره",
    "verificationError": "بررسی امنیتی ناموفق بود. دوباره تلاش کنید.",
    "pending": "در حال ارسال…",
    "submitting": "در حال ارسال…",
    "requestError": "مشکلی پیش آمد. دوباره تلاش کنید.",
    "accepted": "درخواست دریافت شد. برای مرحله بعد ایمیل خود را بررسی کنید.",
    "openLabel": "دریافت خبرها با ایمیل",
    "closeLabel": "بستن",
    "invalidEmail": "یک نشانی ایمیل معتبر وارد کنید."
  },
  "hi": {
    "formLabel": "ईमेल पर खबरें पाएँ",
    "verifying": "जाँच हो रही है…",
    "retryVerification": "फिर जाँच करें",
    "verificationError": "सुरक्षा जाँच पूरी नहीं हुई। फिर कोशिश करें।",
    "pending": "भेज रहे हैं…",
    "submitting": "भेज रहे हैं…",
    "requestError": "कुछ गड़बड़ हुई। फिर कोशिश करें।",
    "accepted": "अनुरोध मिल गया। अगले कदम के लिए अपना ईमेल देखें।",
    "openLabel": "ईमेल पर खबरें पाएँ",
    "closeLabel": "बंद करें",
    "invalidEmail": "सही ईमेल पता दर्ज करें।"
  },
  "bn": {
    "formLabel": "ইমেইলে খবর পেতে নিবন্ধন করুন",
    "verifying": "যাচাই হচ্ছে…",
    "retryVerification": "আবার যাচাই করুন",
    "verificationError": "নিরাপত্তা যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    "pending": "পাঠানো হচ্ছে…",
    "submitting": "পাঠানো হচ্ছে…",
    "requestError": "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    "accepted": "অনুরোধ পেয়েছি। পরের ধাপের জন্য ইমেইল দেখুন।",
    "openLabel": "ইমেইলে খবর পেতে নিবন্ধন করুন",
    "closeLabel": "বন্ধ করুন",
    "invalidEmail": "একটি সঠিক ইমেইল ঠিকানা লিখুন।"
  },
  "ta": {
    "formLabel": "மின்னஞ்சலில் புதிய தகவல்களைப் பெற",
    "verifying": "சரிபார்க்கப்படுகிறது…",
    "retryVerification": "மீண்டும் சரிபார்க்கவும்",
    "verificationError": "பாதுகாப்புச் சரிபார்ப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    "pending": "அனுப்பப்படுகிறது…",
    "submitting": "அனுப்பப்படுகிறது…",
    "requestError": "பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
    "accepted": "கோரிக்கை பெறப்பட்டது. அடுத்த படிக்கு உங்கள் மின்னஞ்சலைப் பாருங்கள்.",
    "openLabel": "மின்னஞ்சலில் புதிய தகவல்களைப் பெற",
    "closeLabel": "மூடு",
    "invalidEmail": "சரியான மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்."
  },
  "ur": {
    "formLabel": "ای میل پر خبروں کے لیے اندراج کریں",
    "verifying": "تصدیق ہو رہی ہے…",
    "retryVerification": "دوبارہ تصدیق کریں",
    "verificationError": "سیکیورٹی کی تصدیق ناکام رہی۔ دوبارہ کوشش کریں۔",
    "pending": "بھیجا جا رہا ہے…",
    "submitting": "بھیجا جا رہا ہے…",
    "requestError": "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
    "accepted": "درخواست موصول ہو گئی۔ اگلے مرحلے کے لیے اپنا ای میل دیکھیں۔",
    "openLabel": "ای میل پر خبروں کے لیے اندراج کریں",
    "closeLabel": "بند کریں",
    "invalidEmail": "درست ای میل پتہ درج کریں۔"
  },
  "id": {
    "formLabel": "Berlangganan kabar lewat email",
    "verifying": "Memverifikasi…",
    "retryVerification": "Ulangi pemeriksaan",
    "verificationError": "Pemeriksaan keamanan gagal. Coba lagi.",
    "pending": "Mengirim…",
    "submitting": "Mengirim…",
    "requestError": "Ada masalah. Coba lagi.",
    "accepted": "Permintaan diterima. Cek emailmu untuk langkah berikutnya.",
    "openLabel": "Berlangganan kabar lewat email",
    "closeLabel": "Tutup",
    "invalidEmail": "Masukkan alamat email yang valid."
  },
  "ms": {
    "formLabel": "Langgan berita melalui e-mel",
    "verifying": "Mengesahkan…",
    "retryVerification": "Cuba semakan lagi",
    "verificationError": "Semakan keselamatan gagal. Cuba lagi.",
    "pending": "Menghantar…",
    "submitting": "Menghantar…",
    "requestError": "Ada masalah. Cuba lagi.",
    "accepted": "Permintaan diterima. Semak e-mel anda untuk langkah seterusnya.",
    "openLabel": "Langgan berita melalui e-mel",
    "closeLabel": "Tutup",
    "invalidEmail": "Masukkan alamat e-mel yang sah."
  },
  "vi": {
    "formLabel": "Đăng ký nhận tin qua email",
    "verifying": "Đang xác minh…",
    "retryVerification": "Xác minh lại",
    "verificationError": "Xác minh bảo mật không thành công. Hãy thử lại.",
    "pending": "Đang gửi…",
    "submitting": "Đang gửi…",
    "requestError": "Đã xảy ra lỗi. Hãy thử lại.",
    "accepted": "Đã nhận yêu cầu. Kiểm tra email để xem bước tiếp theo.",
    "openLabel": "Đăng ký nhận tin qua email",
    "closeLabel": "Đóng",
    "invalidEmail": "Nhập địa chỉ email hợp lệ."
  },
  "th": {
    "formLabel": "สมัครรับข่าวสารทางอีเมล",
    "verifying": "กำลังตรวจสอบ…",
    "retryVerification": "ตรวจสอบอีกครั้ง",
    "verificationError": "การตรวจสอบความปลอดภัยไม่สำเร็จ กรุณาลองอีกครั้ง",
    "pending": "กำลังส่ง…",
    "submitting": "กำลังส่ง…",
    "requestError": "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
    "accepted": "ได้รับคำขอแล้ว เช็กอีเมลเพื่อดูขั้นตอนถัดไป",
    "openLabel": "สมัครรับข่าวสารทางอีเมล",
    "closeLabel": "ปิด",
    "invalidEmail": "กรุณากรอกอีเมลให้ถูกต้อง"
  },
  "fil": {
    "formLabel": "Tumanggap ng mga balita sa email",
    "verifying": "Bineberipika…",
    "retryVerification": "Ulitin ang pagsusuri",
    "verificationError": "Hindi nagtagumpay ang pagsusuri sa seguridad. Subukan ulit.",
    "pending": "Ipinapadala…",
    "submitting": "Ipinapadala…",
    "requestError": "May nagkaproblema. Subukan ulit.",
    "accepted": "Natanggap ang request. Tingnan ang email para sa susunod na hakbang.",
    "openLabel": "Tumanggap ng mga balita sa email",
    "closeLabel": "Isara",
    "invalidEmail": "Maglagay ng wastong email address."
  },
  "ja": {
    "formLabel": "メールでニュースを受け取る",
    "verifying": "確認中…",
    "retryVerification": "もう一度確認",
    "verificationError": "セキュリティ確認に失敗しました。もう一度お試しください。",
    "pending": "送信中…",
    "submitting": "送信中…",
    "requestError": "エラーが発生しました。もう一度お試しください。",
    "accepted": "リクエストを受け付けました。次の手順をメールでご確認ください。",
    "openLabel": "メールでニュースを受け取る",
    "closeLabel": "閉じる",
    "invalidEmail": "有効なメールアドレスを入力してください。"
  },
  "ko": {
    "formLabel": "이메일로 소식 구독하기",
    "verifying": "확인 중…",
    "retryVerification": "다시 확인하기",
    "verificationError": "보안 확인에 실패했어요. 다시 시도해 주세요.",
    "pending": "보내는 중…",
    "submitting": "보내는 중…",
    "requestError": "문제가 생겼어요. 다시 시도해 주세요.",
    "accepted": "요청을 받았어요. 다음 단계는 이메일을 확인해 주세요.",
    "openLabel": "이메일로 소식 구독하기",
    "closeLabel": "닫기",
    "invalidEmail": "올바른 이메일 주소를 입력해 주세요."
  },
  "zh-Hans": {
    "formLabel": "通过邮件订阅新消息",
    "verifying": "验证中…",
    "retryVerification": "重新验证",
    "verificationError": "安全验证失败，请重试。",
    "pending": "发送中…",
    "submitting": "发送中…",
    "requestError": "出了点问题，请重试。",
    "accepted": "已收到请求。请查看邮件，了解下一步。",
    "openLabel": "通过邮件订阅新消息",
    "closeLabel": "关闭",
    "invalidEmail": "请输入有效的邮箱地址。"
  },
  "zh-Hant-TW": {
    "formLabel": "訂閱電子報",
    "verifying": "驗證中…",
    "retryVerification": "重新驗證",
    "verificationError": "安全驗證失敗，請再試一次。",
    "pending": "傳送中…",
    "submitting": "傳送中…",
    "requestError": "出了點問題，請再試一次。",
    "accepted": "已收到申請。請查看信箱，了解下一步。",
    "openLabel": "訂閱電子報",
    "closeLabel": "關閉",
    "invalidEmail": "請輸入有效的電子信箱。"
  },
  "zh-Hant-HK": {
    "formLabel": "透過電郵訂閱最新消息",
    "verifying": "驗證中…",
    "retryVerification": "重新驗證",
    "verificationError": "安全驗證失敗，請再試一次。",
    "pending": "傳送中…",
    "submitting": "傳送中…",
    "requestError": "出現問題，請再試一次。",
    "accepted": "已收到申請。請查看電郵，了解下一步。",
    "openLabel": "透過電郵訂閱最新消息",
    "closeLabel": "關閉",
    "invalidEmail": "請輸入有效的電郵地址。"
  },
  "sw": {
    "formLabel": "Jiandikishe kupokea habari kwa barua pepe",
    "verifying": "Inathibitisha…",
    "retryVerification": "Rudia uthibitishaji",
    "verificationError": "Ukaguzi wa usalama umeshindwa. Jaribu tena.",
    "pending": "Inatuma…",
    "submitting": "Inatuma…",
    "requestError": "Hitilafu imetokea. Jaribu tena.",
    "accepted": "Ombi limepokelewa. Angalia barua pepe yako kwa hatua inayofuata.",
    "openLabel": "Jiandikishe kupokea habari kwa barua pepe",
    "closeLabel": "Funga",
    "invalidEmail": "Weka anwani sahihi ya barua pepe."
  },
  "af": {
    "formLabel": "Teken in vir nuus per e-pos",
    "verifying": "Verifieer tans…",
    "retryVerification": "Probeer die kontrole weer",
    "verificationError": "Die sekuriteitskontrole het misluk. Probeer weer.",
    "pending": "Stuur tans…",
    "submitting": "Stuur tans…",
    "requestError": "Iets het skeefgeloop. Probeer weer.",
    "accepted": "Versoek ontvang. Kyk in jou e-pos vir die volgende stap.",
    "openLabel": "Teken in vir nuus per e-pos",
    "closeLabel": "Sluit",
    "invalidEmail": "Voer ’n geldige e-posadres in."
  }
} as const satisfies Record<string, SharedMessages>;

function defineLocale(
  locale: string,
  messageKey: keyof typeof sharedMessages,
  directButton: string,
  directPlaceholder: string,
  invitingButton: string,
  invitingPlaceholder: string,
  dir: "ltr" | "rtl" = "ltr",
): FooterLocale {
  const shared = sharedMessages[messageKey];
  return Object.freeze({
    locale,
    dir,
    styles: Object.freeze({
      direct: Object.freeze({ ...shared, button: directButton, placeholder: directPlaceholder, emailLabel: directPlaceholder }),
      inviting: Object.freeze({ ...shared, button: invitingButton, placeholder: invitingPlaceholder, emailLabel: directPlaceholder }),
    }),
  });
}

/** Immutable, canonical BCP 47 locale records. Regional siblings may share wording. */
export const FOOTER_LOCALES: Readonly<Record<string, FooterLocale>> = Object.freeze({
  en: defineLocale("en", "en", "Subscribe", "Email address", "Sign me up", "Where should updates land?"),
  "en-US": defineLocale("en-US", "en", "Subscribe", "Your email address", "Sign me up", "Where should updates land?"),
  "en-GB": defineLocale("en-GB", "en", "Subscribe", "Your email address", "Keep me in the loop", "Email for the latest"),
  "en-AU": defineLocale("en-AU", "en", "Get updates", "Your email address", "Keep me posted", "Send the latest to this email"),
  "en-IN": defineLocale("en-IN", "en", "Subscribe", "Email address", "Send me updates", "Your email for what’s new"),
  "en-SG": defineLocale("en-SG", "en", "Get updates", "Email address", "Keep me in the loop", "Email for new things"),
  "es-ES": defineLocale("es-ES", "es", "Suscribirme", "Tu correo electrónico", "Quiero enterarme", "Tu correo para las novedades"),
  "es-MX": defineLocale("es-MX", "es", "Suscribirme", "Tu correo electrónico", "Quiero las novedades", "¿A qué correo te escribimos?"),
  "es-AR": defineLocale("es-AR", "es-AR", "Suscribite", "Tu correo electrónico", "Avisame qué viene", "Dejanos tu mail"),
  "es-CL": defineLocale("es-CL", "es", "Suscribirme", "Tu correo electrónico", "Avísenme las novedades", "Tu correo para estar al día"),
  "es-CO": defineLocale("es-CO", "es", "Recibir novedades", "Tu correo electrónico", "Quiero estar al día", "¿Dónde te enviamos lo nuevo?"),
  "es-PR": defineLocale("es-PR", "es", "Suscribirme", "Tu email", "Quiero enterarme", "Tu email para lo nuevo"),
  "fr-FR": defineLocale("fr-FR", "fr", "S’abonner", "Votre adresse e-mail", "Je m’inscris", "Les nouveautés, à quelle adresse ?"),
  "fr-CA": defineLocale("fr-CA", "fr-CA", "M’abonner", "Votre adresse courriel", "Je veux des nouvelles", "Votre courriel pour la suite"),
  "pt-BR": defineLocale("pt-BR", "pt-BR", "Inscreva-se", "Seu e-mail", "Quero novidades", "Qual e-mail recebe as novidades?"),
  "pt-PT": defineLocale("pt-PT", "pt-PT", "Subscrever", "O seu e-mail", "Quero ficar a par", "O seu e-mail para as novidades"),
  "de-DE": defineLocale("de-DE", "de", "Abonnieren", "Deine E-Mail-Adresse", "Halt mich auf dem Laufenden", "Wohin dürfen die Neuigkeiten?"),
  "de-CH": defineLocale("de-CH", "de", "Abonnieren", "Deine E-Mail-Adresse", "Ich will Neues erfahren", "Deine E-Mail für Neuigkeiten"),
  "nl-NL": defineLocale("nl-NL", "nl", "Aanmelden", "Je e-mailadres", "Houd me op de hoogte", "Waar mogen de nieuwtjes heen?"),
  "nl-BE": defineLocale("nl-BE", "nl", "Inschrijven", "Je e-mailadres", "Hou me op de hoogte", "Je e-mail voor het laatste nieuws"),
  "it-IT": defineLocale("it-IT", "it", "Iscrivimi", "La tua email", "Tienimi al corrente", "Dove ti mandiamo le novità?"),
  "ca-ES": defineLocale("ca-ES", "ca", "Subscriu-m’hi", "El teu correu electrònic", "Vull estar al dia", "On t’enviem les novetats?"),
  "sv-SE": defineLocale("sv-SE", "sv", "Prenumerera", "Din e-postadress", "Håll mig uppdaterad", "Vart ska vi skicka nyheterna?"),
  "da-DK": defineLocale("da-DK", "da", "Tilmeld mig", "Din e-mailadresse", "Hold mig opdateret", "Hvor skal vi sende nyt hen?"),
  "nb-NO": defineLocale("nb-NO", "nb", "Abonner", "E-postadressen din", "Hold meg oppdatert", "Hvor skal vi sende nytt?"),
  "fi-FI": defineLocale("fi-FI", "fi", "Tilaa uutiset", "Sähköpostiosoitteesi", "Pidä minut ajan tasalla", "Mihin lähetämme uutiset?"),
  "pl-PL": defineLocale("pl-PL", "pl", "Zapisz mnie", "Twój adres e-mail", "Chcę być na bieżąco", "Gdzie wysyłać nowości?"),
  "cs-CZ": defineLocale("cs-CZ", "cs", "Odebírat novinky", "Tvůj e-mail", "Chci vědět, co je nového", "Kam ti pošleme novinky?"),
  "sk-SK": defineLocale("sk-SK", "sk", "Odoberať novinky", "Tvoj e-mail", "Chcem vedieť, čo je nové", "Kam ti pošleme novinky?"),
  "hu-HU": defineLocale("hu-HU", "hu", "Feliratkozom", "Az e-mail-címed", "Kérem az újdonságokat", "Hová küldhetjük a híreket?"),
  "ro-RO": defineLocale("ro-RO", "ro", "Abonează-mă", "Adresa ta de e-mail", "Vreau noutăți", "Unde îți trimitem noutățile?"),
  "el-GR": defineLocale("el-GR", "el", "Εγγραφή", "Το email σου", "Θέλω να μαθαίνω τα νέα", "Πού να στέλνουμε τα νέα;"),
  "bg-BG": defineLocale("bg-BG", "bg", "Абонирай ме", "Твоят имейл", "Искам да научавам новостите", "Къде да изпращаме новините?"),
  "hr-HR": defineLocale("hr-HR", "hr", "Pretplati me", "Tvoja e-adresa", "Želim čuti novosti", "Kamo šaljemo novosti?"),
  "sl-SI": defineLocale("sl-SI", "sl", "Naroči me", "Tvoj e-naslov", "Želim biti na tekočem", "Kam naj pošljemo novosti?"),
  "sr-Latn-RS": defineLocale("sr-Latn-RS", "sr-Latn", "Prijavi me", "Tvoja imejl adresa", "Želim da čujem novosti", "Gde da šaljemo novosti?"),
  "sr-Cyrl-RS": defineLocale("sr-Cyrl-RS", "sr-Cyrl", "Пријави ме", "Твоја имејл адреса", "Желим да чујем новости", "Где да шаљемо новости?"),
  "uk-UA": defineLocale("uk-UA", "uk", "Підписатися", "Твоя електронна адреса", "Хочу знати, що нового", "Куди надсилати новини?"),
  "ru-RU": defineLocale("ru-RU", "ru", "Подписаться", "Твоя электронная почта", "Хочу быть в курсе", "Куда присылать новости?"),
  "tr-TR": defineLocale("tr-TR", "tr", "Abone ol", "E-posta adresin", "Yeniliklerden haberim olsun", "Haberleri hangi adrese gönderelim?"),
  "ar": defineLocale("ar", "ar", "اشترك", "بريدك الإلكتروني", "أرسلوا لي الجديد", "أين نرسل لك الأخبار؟", "rtl"),
  "ar-EG": defineLocale("ar-EG", "ar", "اشترك", "بريدك الإلكتروني", "أرسلوا لي الأخبار", "بريدك لتصلك الأخبار", "rtl"),
  "ar-SA": defineLocale("ar-SA", "ar", "اشترك", "بريدك الإلكتروني", "أريد معرفة الجديد", "بريدك لآخر المستجدات", "rtl"),
  "he-IL": defineLocale("he-IL", "he", "הרשמה לעדכונים", "כתובת האימייל שלך", "אשמח להתעדכן", "לאן לשלוח את החדשות?", "rtl"),
  "fa-IR": defineLocale("fa-IR", "fa", "دریافت خبرها", "نشانی ایمیل شما", "من را هم باخبر کنید", "خبرها را به کدام ایمیل بفرستیم؟", "rtl"),
  "hi-IN": defineLocale("hi-IN", "hi", "अपडेट पाएँ", "आपका ईमेल पता", "मुझे भी बताते रहें", "नई खबरें किस ईमेल पर भेजें?"),
  "bn-BD": defineLocale("bn-BD", "bn", "আপডেট পেতে চাই", "আপনার ইমেইল", "আমাকেও জানাবেন", "নতুন খবর কোন ইমেইলে পাঠাব?"),
  "ta-IN": defineLocale("ta-IN", "ta", "புதிய தகவல்களைப் பெற", "உங்கள் மின்னஞ்சல்", "எனக்கும் தெரியப்படுத்துங்கள்", "எந்த மின்னஞ்சலுக்கு அனுப்பலாம்?"),
  "ur-PK": defineLocale("ur-PK", "ur", "اپ ڈیٹس حاصل کریں", "آپ کا ای میل پتہ", "مجھے بھی باخبر رکھیں", "نئی خبریں کس ای میل پر بھیجیں؟", "rtl"),
  "id-ID": defineLocale("id-ID", "id", "Berlangganan", "Alamat email kamu", "Kabari aku, ya", "Email untuk kabar terbaru"),
  "ms-MY": defineLocale("ms-MY", "ms", "Langgan", "Alamat e-mel anda", "Saya mahu berita terkini", "E-mel untuk berita terkini"),
  "vi-VN": defineLocale("vi-VN", "vi", "Đăng ký nhận tin", "Email của bạn", "Cho mình biết nhé", "Gửi tin mới đến email nào?"),
  "th-TH": defineLocale("th-TH", "th", "รับข่าวสาร", "อีเมลของคุณ", "มีอะไรใหม่ บอกกันด้วย", "ส่งข่าวใหม่ไปที่อีเมลไหน?"),
  "fil-PH": defineLocale("fil-PH", "fil", "Tumanggap ng updates", "Email mo", "Gusto ko ng balita", "Saan namin ipapadala ang balita?"),
  "ja-JP": defineLocale("ja-JP", "ja", "ニュースを受け取る", "メールアドレス", "新着情報を届けて", "お届け先のメールアドレス"),
  "ko-KR": defineLocale("ko-KR", "ko", "구독하기", "이메일 주소", "새 소식 받을래요", "소식 받을 이메일을 알려 주세요"),
  "zh-Hans-CN": defineLocale("zh-Hans-CN", "zh-Hans", "订阅更新", "你的邮箱地址", "有新消息告诉我", "新消息发到哪个邮箱？"),
  "zh-Hant-TW": defineLocale("zh-Hant-TW", "zh-Hant-TW", "訂閱電子報", "你的電子信箱", "有新消息，告訴我", "新消息寄到哪個信箱？"),
  "zh-Hant-HK": defineLocale("zh-Hant-HK", "zh-Hant-HK", "訂閱最新消息", "你的電郵地址", "有新消息，通知我", "接收最新消息的電郵"),
  "sw-KE": defineLocale("sw-KE", "sw", "Pokea taarifa", "Barua pepe yako", "Nijulishe mapya", "Tutume habari kwenye barua pepe ipi?"),
  "af-ZA": defineLocale("af-ZA", "af", "Teken in", "Jou e-posadres", "Hou my op hoogte", "Waarheen stuur ons die nuus?"),
});

const languageDefaults: Readonly<Record<string, string>> = Object.freeze({
  "en": "en",
  "es": "es-ES",
  "fr": "fr-FR",
  "pt": "pt-BR",
  "de": "de-DE",
  "nl": "nl-NL",
  "it": "it-IT",
  "ca": "ca-ES",
  "sv": "sv-SE",
  "da": "da-DK",
  "nb": "nb-NO",
  "fi": "fi-FI",
  "pl": "pl-PL",
  "cs": "cs-CZ",
  "sk": "sk-SK",
  "hu": "hu-HU",
  "ro": "ro-RO",
  "el": "el-GR",
  "bg": "bg-BG",
  "hr": "hr-HR",
  "sl": "sl-SI",
  "sr": "sr-Cyrl-RS",
  "uk": "uk-UA",
  "ru": "ru-RU",
  "tr": "tr-TR",
  "ar": "ar",
  "he": "he-IL",
  "fa": "fa-IR",
  "hi": "hi-IN",
  "bn": "bn-BD",
  "ta": "ta-IN",
  "ur": "ur-PK",
  "id": "id-ID",
  "ms": "ms-MY",
  "vi": "vi-VN",
  "th": "th-TH",
  "fil": "fil-PH",
  "ja": "ja-JP",
  "ko": "ko-KR",
  "zh": "zh-Hans-CN",
  "sw": "sw-KE",
  "af": "af-ZA"
});

function matchLocale(preference: string): FooterLocale | undefined {
  const value = preference.trim();
  if (!value || value.length > 100) return undefined;
  let parsed: Intl.Locale;
  try {
    parsed = new Intl.Locale(value);
  } catch {
    return undefined;
  }
  // baseName drops extensions (e.g. -u-ca-gregory) without guessing language.
  const exact = FOOTER_LOCALES[parsed.baseName];
  if (exact) return exact;
  const { language, region, script } = parsed;
  if (language === "zh") {
    // Explicit script wins over region, including unusual but valid combinations.
    if (script && script !== "Hans" && script !== "Hant") return undefined;
    if (script === "Hans") return FOOTER_LOCALES["zh-Hans-CN"];
    if (script === "Hant" || region === "HK" || region === "MO" || region === "TW") {
      return FOOTER_LOCALES[region === "HK" || region === "MO" ? "zh-Hant-HK" : "zh-Hant-TW"];
    }
    return FOOTER_LOCALES["zh-Hans-CN"];
  }
  if (language === "sr") {
    if (script && script !== "Latn" && script !== "Cyrl") return undefined;
    return FOOTER_LOCALES[script === "Latn" ? "sr-Latn-RS" : "sr-Cyrl-RS"];
  }
  // Never discard an explicit unsupported script and silently change alphabets.
  const defaultKey = languageDefaults[language];
  if (!defaultKey) return undefined;
  if (script) {
    const defaultScript = new Intl.Locale(defaultKey).maximize().script;
    if (script !== defaultScript) return undefined;
  }
  // es-419 is broad Latin American Spanish, not Spain; explicit region wins above.
  if (language === "es" && region === "419") return FOOTER_LOCALES["es-MX"];
  return FOOTER_LOCALES[defaultKey];
}

/**
 * Resolve an explicit locale or ordered preferences. Pure and SSR-safe: callers
 * may pass navigator.languages after hydration, never during a server render.
 * Unknown/malformed preferences are skipped, then deterministic English is used.
 */
export function resolveFooterLocale(preferred?: string | readonly string[]): FooterLocale {
  const preferences = typeof preferred === "string" ? [preferred] : preferred ?? [];
  for (const preference of preferences) {
    if (typeof preference !== "string") continue;
    const locale = matchLocale(preference);
    if (locale) return locale;
  }
  return FOOTER_LOCALES.en!;
}
