/**
 * Canonical copy for the shared signup and account controls.
 * See docs/localization.md for evidence, register choices and fallback rules.
 * These are reviewed-as-code translation drafts, not native-speaker validation.
 */
export const FOOTER_COPY_STYLES = ["direct", "inviting", "goblin", "cosmic", "chaos", "secret"] as const;
export type FooterCopyStyle = typeof FOOTER_COPY_STYLES[number];
export type LocalizedFooterCopyStyle = "direct" | "inviting";

/** Paired hypotheses stay stable within an enrollment; never randomize each render. */
export const ENGLISH_FOOTER_COPY = Object.freeze({
  direct: { button: "Send me things", placeholder: "sjobs@apple.com" },
  inviting: { button: "I'm curious", placeholder: "billg@microsoft.com" },
  goblin: { button: "Feed the goblin", placeholder: "chunkylover53@aol.com" },
  cosmic: { button: "Beam me up", placeholder: "tom@myspace.com" },
  chaos: { button: "Push the button", placeholder: "neo@metacortex.com" },
  secret: { button: "Let me in", placeholder: "satoshin@gmx.com" },
} as const);

export function isFooterCopyStyle(value: unknown): value is FooterCopyStyle {
  return typeof value === "string" && (FOOTER_COPY_STYLES as readonly string[]).includes(value);
}

export function supportsFooterCopyStyle(locale: string, style: FooterCopyStyle): boolean {
  return /^en(?:-|$)/u.test(locale) || style === "direct" || style === "inviting";
}

export type FooterMessages = Readonly<{
  button: string;
  placeholder: string;
  emailLabel: string;
  formLabel: string;
  pending: string;
  submitting: string;
  requestError: string;
  accepted: string;
  openLabel: string;
  closeLabel: string;
  invalidEmail: string;
}>;

export type FooterLocale = Readonly<{
  locale: string;
  dir: "ltr" | "rtl";
  accountLabel: string;
  styles: Readonly<Record<LocalizedFooterCopyStyle, FooterMessages>> & Readonly<Partial<Record<FooterCopyStyle, FooterMessages>>>;
}>;

type SharedMessages = Omit<FooterMessages, "button" | "placeholder" | "emailLabel">;

const sharedMessages = {
  "en": {
    "formLabel": "Subscribe by email",
    "pending": "Subscribing…",
    "submitting": "Submitting your email…",
    "requestError": "Couldn't subscribe. Try again.",
    "accepted": "Check your email for a confirmation link.",
    "openLabel": "Subscribe by email",
    "closeLabel": "Close email signup",
    "invalidEmail": "Enter a valid email address."
  },
  "es": {
    "formLabel": "Recibir novedades por correo",
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
    "pending": "Stuur tans…",
    "submitting": "Stuur tans…",
    "requestError": "Iets het skeefgeloop. Probeer weer.",
    "accepted": "Versoek ontvang. Kyk in jou e-pos vir die volgende stap.",
    "openLabel": "Teken in vir nuus per e-pos",
    "closeLabel": "Sluit",
    "invalidEmail": "Voer ’n geldige e-posadres in."
  }
} as const satisfies Record<string, SharedMessages>;

const accountLabels = {
  "en": "My account",
  "es": "Mi cuenta",
  "es-AR": "Mi cuenta",
  "fr": "Mon compte",
  "fr-CA": "Mon compte",
  "pt-BR": "Minha conta",
  "pt-PT": "A minha conta",
  "de": "Mein Konto",
  "nl": "Mijn account",
  "it": "Il mio account",
  "ca": "El meu compte",
  "sv": "Mitt konto",
  "da": "Min konto",
  "nb": "Min konto",
  "fi": "Oma tili",
  "pl": "Moje konto",
  "cs": "Můj účet",
  "sk": "Môj účet",
  "hu": "Saját fiók",
  "ro": "Contul meu",
  "el": "Ο λογαριασμός μου",
  "bg": "Моят профил",
  "hr": "Moj račun",
  "sl": "Moj račun",
  "sr-Cyrl": "Мој налог",
  "sr-Latn": "Moj nalog",
  "uk": "Мій обліковий запис",
  "ru": "Мой аккаунт",
  "tr": "Hesabım",
  "ar": "حسابي",
  "he": "החשבון שלי",
  "fa": "حساب من",
  "hi": "मेरा खाता",
  "bn": "আমার অ্যাকাউন্ট",
  "ta": "எனது கணக்கு",
  "ur": "میرا اکاؤنٹ",
  "id": "Akun saya",
  "ms": "Akaun saya",
  "vi": "Tài khoản của tôi",
  "th": "บัญชีของฉัน",
  "fil": "Account ko",
  "ja": "マイアカウント",
  "ko": "내 계정",
  "zh-Hans": "我的账户",
  "zh-Hant-TW": "我的帳戶",
  "zh-Hant-HK": "我的帳戶",
  "sw": "Akaunti yangu",
  "af": "My rekening"
} as const satisfies Record<keyof typeof sharedMessages, string>;

function defineLocale(
  locale: string,
  messageKey: keyof typeof sharedMessages,
  directButton: string,
  emailLabel: string,
  invitingButton: string,
  dir: "ltr" | "rtl" = "ltr",
): FooterLocale {
  const shared = sharedMessages[messageKey];
  return Object.freeze({
    locale,
    dir,
    accountLabel: accountLabels[messageKey],
    styles: Object.freeze({
      direct: Object.freeze({ ...shared, button: directButton, placeholder: ENGLISH_FOOTER_COPY.direct.placeholder, emailLabel }),
      inviting: Object.freeze({ ...shared, button: invitingButton, placeholder: ENGLISH_FOOTER_COPY.inviting.placeholder, emailLabel }),
      ...(messageKey === "en" ? Object.fromEntries(Object.entries(ENGLISH_FOOTER_COPY).map(([key, copy]) => [
        key, Object.freeze({ ...shared, ...copy, emailLabel: "Email address" }),
      ])) : {}),
    }),
  });
}

/** Immutable, canonical BCP 47 locale records. Regional siblings may share wording. */
export const FOOTER_LOCALES: Readonly<Record<string, FooterLocale>> = Object.freeze({
  en: defineLocale("en", "en", "Subscribe", "Email address", "Sign me up"),
  "en-US": defineLocale("en-US", "en", "Subscribe", "Your email address", "Sign me up"),
  "en-GB": defineLocale("en-GB", "en", "Subscribe", "Your email address", "Keep me in the loop"),
  "en-AU": defineLocale("en-AU", "en", "Get updates", "Your email address", "Keep me posted"),
  "en-IN": defineLocale("en-IN", "en", "Subscribe", "Email address", "Send me updates"),
  "en-SG": defineLocale("en-SG", "en", "Get updates", "Email address", "Keep me in the loop"),
  "es-ES": defineLocale("es-ES", "es", "Suscribirme", "Tu correo electrónico", "Quiero enterarme"),
  "es-MX": defineLocale("es-MX", "es", "Suscribirme", "Tu correo electrónico", "Quiero las novedades"),
  "es-AR": defineLocale("es-AR", "es-AR", "Suscribite", "Tu correo electrónico", "Avisame qué viene"),
  "es-CL": defineLocale("es-CL", "es", "Suscribirme", "Tu correo electrónico", "Avísenme las novedades"),
  "es-CO": defineLocale("es-CO", "es", "Recibir novedades", "Tu correo electrónico", "Quiero estar al día"),
  "es-PR": defineLocale("es-PR", "es", "Suscribirme", "Tu email", "Quiero enterarme"),
  "fr-FR": defineLocale("fr-FR", "fr", "S’abonner", "Votre adresse e-mail", "Je m’inscris"),
  "fr-CA": defineLocale("fr-CA", "fr-CA", "M’abonner", "Votre adresse courriel", "Je veux des nouvelles"),
  "pt-BR": defineLocale("pt-BR", "pt-BR", "Inscreva-se", "Seu e-mail", "Quero novidades"),
  "pt-PT": defineLocale("pt-PT", "pt-PT", "Subscrever", "O seu e-mail", "Quero ficar a par"),
  "de-DE": defineLocale("de-DE", "de", "Abonnieren", "Deine E-Mail-Adresse", "Halt mich auf dem Laufenden"),
  "de-CH": defineLocale("de-CH", "de", "Abonnieren", "Deine E-Mail-Adresse", "Ich will Neues erfahren"),
  "nl-NL": defineLocale("nl-NL", "nl", "Aanmelden", "Je e-mailadres", "Houd me op de hoogte"),
  "nl-BE": defineLocale("nl-BE", "nl", "Inschrijven", "Je e-mailadres", "Hou me op de hoogte"),
  "it-IT": defineLocale("it-IT", "it", "Iscrivimi", "La tua email", "Tienimi al corrente"),
  "ca-ES": defineLocale("ca-ES", "ca", "Subscriu-m’hi", "El teu correu electrònic", "Vull estar al dia"),
  "sv-SE": defineLocale("sv-SE", "sv", "Prenumerera", "Din e-postadress", "Håll mig uppdaterad"),
  "da-DK": defineLocale("da-DK", "da", "Tilmeld mig", "Din e-mailadresse", "Hold mig opdateret"),
  "nb-NO": defineLocale("nb-NO", "nb", "Abonner", "E-postadressen din", "Hold meg oppdatert"),
  "fi-FI": defineLocale("fi-FI", "fi", "Tilaa uutiset", "Sähköpostiosoitteesi", "Pidä minut ajan tasalla"),
  "pl-PL": defineLocale("pl-PL", "pl", "Zapisz mnie", "Twój adres e-mail", "Chcę być na bieżąco"),
  "cs-CZ": defineLocale("cs-CZ", "cs", "Odebírat novinky", "Tvůj e-mail", "Chci vědět, co je nového"),
  "sk-SK": defineLocale("sk-SK", "sk", "Odoberať novinky", "Tvoj e-mail", "Chcem vedieť, čo je nové"),
  "hu-HU": defineLocale("hu-HU", "hu", "Feliratkozom", "Az e-mail-címed", "Kérem az újdonságokat"),
  "ro-RO": defineLocale("ro-RO", "ro", "Abonează-mă", "Adresa ta de e-mail", "Vreau noutăți"),
  "el-GR": defineLocale("el-GR", "el", "Εγγραφή", "Το email σου", "Θέλω να μαθαίνω τα νέα"),
  "bg-BG": defineLocale("bg-BG", "bg", "Абонирай ме", "Твоят имейл", "Искам да научавам новостите"),
  "hr-HR": defineLocale("hr-HR", "hr", "Pretplati me", "Tvoja e-adresa", "Želim čuti novosti"),
  "sl-SI": defineLocale("sl-SI", "sl", "Naroči me", "Tvoj e-naslov", "Želim biti na tekočem"),
  "sr-Latn-RS": defineLocale("sr-Latn-RS", "sr-Latn", "Prijavi me", "Tvoja imejl adresa", "Želim da čujem novosti"),
  "sr-Cyrl-RS": defineLocale("sr-Cyrl-RS", "sr-Cyrl", "Пријави ме", "Твоја имејл адреса", "Желим да чујем новости"),
  "uk-UA": defineLocale("uk-UA", "uk", "Підписатися", "Твоя електронна адреса", "Хочу знати, що нового"),
  "ru-RU": defineLocale("ru-RU", "ru", "Подписаться", "Твоя электронная почта", "Хочу быть в курсе"),
  "tr-TR": defineLocale("tr-TR", "tr", "Abone ol", "E-posta adresin", "Yeniliklerden haberim olsun"),
  "ar": defineLocale("ar", "ar", "اشترك", "بريدك الإلكتروني", "أرسلوا لي الجديد", "rtl"),
  "ar-EG": defineLocale("ar-EG", "ar", "اشترك", "بريدك الإلكتروني", "أرسلوا لي الأخبار", "rtl"),
  "ar-SA": defineLocale("ar-SA", "ar", "اشترك", "بريدك الإلكتروني", "أريد معرفة الجديد", "rtl"),
  "he-IL": defineLocale("he-IL", "he", "הרשמה לעדכונים", "כתובת האימייל שלך", "אשמח להתעדכן", "rtl"),
  "fa-IR": defineLocale("fa-IR", "fa", "دریافت خبرها", "نشانی ایمیل شما", "من را هم باخبر کنید", "rtl"),
  "hi-IN": defineLocale("hi-IN", "hi", "अपडेट पाएँ", "आपका ईमेल पता", "मुझे भी बताते रहें"),
  "bn-BD": defineLocale("bn-BD", "bn", "আপডেট পেতে চাই", "আপনার ইমেইল", "আমাকেও জানাবেন"),
  "ta-IN": defineLocale("ta-IN", "ta", "புதிய தகவல்களைப் பெற", "உங்கள் மின்னஞ்சல்", "எனக்கும் தெரியப்படுத்துங்கள்"),
  "ur-PK": defineLocale("ur-PK", "ur", "اپ ڈیٹس حاصل کریں", "آپ کا ای میل پتہ", "مجھے بھی باخبر رکھیں", "rtl"),
  "id-ID": defineLocale("id-ID", "id", "Berlangganan", "Alamat email kamu", "Kabari aku, ya"),
  "ms-MY": defineLocale("ms-MY", "ms", "Langgan", "Alamat e-mel anda", "Saya mahu berita terkini"),
  "vi-VN": defineLocale("vi-VN", "vi", "Đăng ký nhận tin", "Email của bạn", "Cho mình biết nhé"),
  "th-TH": defineLocale("th-TH", "th", "รับข่าวสาร", "อีเมลของคุณ", "มีอะไรใหม่ บอกกันด้วย"),
  "fil-PH": defineLocale("fil-PH", "fil", "Tumanggap ng updates", "Email mo", "Gusto ko ng balita"),
  "ja-JP": defineLocale("ja-JP", "ja", "ニュースを受け取る", "メールアドレス", "新着情報を届けて"),
  "ko-KR": defineLocale("ko-KR", "ko", "구독하기", "이메일 주소", "새 소식 받을래요"),
  "zh-Hans-CN": defineLocale("zh-Hans-CN", "zh-Hans", "订阅更新", "你的邮箱地址", "有新消息告诉我"),
  "zh-Hant-TW": defineLocale("zh-Hant-TW", "zh-Hant-TW", "訂閱電子報", "你的電子信箱", "有新消息，告訴我"),
  "zh-Hant-HK": defineLocale("zh-Hant-HK", "zh-Hant-HK", "訂閱最新消息", "你的電郵地址", "有新消息，通知我"),
  "sw-KE": defineLocale("sw-KE", "sw", "Pokea taarifa", "Barua pepe yako", "Nijulishe mapya"),
  "af-ZA": defineLocale("af-ZA", "af", "Teken in", "Jou e-posadres", "Hou my op hoogte"),
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

const stableDescriptions: Readonly<Record<string, string>> = {
  en: "Get updates by email. You're subscribed once you confirm your address.",
  es: "Recibe novedades por correo. Confirma tu dirección para suscribirte.",
  fr: "Recevez les nouveautés par e-mail. Confirmez votre adresse pour vous abonner.",
  pt: "Receba novidades por e-mail. Confirme seu endereço para assinar.",
  de: "Erhalte Neuigkeiten per E-Mail. Bestätige deine Adresse, um dich anzumelden.",
  nl: "Ontvang nieuws per e-mail. Bevestig je adres om je aan te melden.",
  it: "Ricevi novità via email. Conferma il tuo indirizzo per iscriverti.",
  ca: "Rep novetats per correu. Confirma la teva adreça per subscriure-t'hi.",
  sv: "Få nyheter via e-post. Bekräfta din adress för att prenumerera.",
  da: "Få nyt via e-mail. Bekræft din adresse for at tilmelde dig.",
  nb: "Få nyheter på e-post. Bekreft adressen din for å abonnere.",
  fi: "Saa uutisia sähköpostitse. Vahvista osoitteesi tilataksesi.",
  pl: "Otrzymuj nowości e-mailem. Potwierdź adres, aby się zapisać.",
  cs: "Dostávejte novinky e-mailem. Pro odběr potvrďte svou adresu.",
  sk: "Dostávajte novinky e-mailom. Na odber potvrďte svoju adresu.",
  hu: "Kapj híreket e-mailben. A feliratkozáshoz erősítsd meg a címed.",
  ro: "Primește noutăți prin e-mail. Confirmă adresa pentru a te abona.",
  el: "Λάβετε νέα μέσω email. Επιβεβαιώστε τη διεύθυνσή σας για εγγραφή.",
  bg: "Получавайте новини по имейл. Потвърдете адреса си, за да се абонирате.",
  hr: "Primajte novosti e-poštom. Potvrdite adresu za pretplatu.",
  sl: "Prejemajte novice po e-pošti. Za naročilo potrdite svoj naslov.",
  "sr-Cyrl": "Примајте новости е-поштом. Потврдите адресу да бисте се претплатили.",
  "sr-Latn": "Primajte novosti e-poštom. Potvrdite adresu da biste se pretplatili.",
  uk: "Отримуйте новини електронною поштою. Підтвердьте адресу, щоб підписатися.",
  ru: "Получайте новости по электронной почте. Подтвердите адрес, чтобы подписаться.",
  tr: "Yenilikleri e-postayla alın. Abone olmak için adresinizi doğrulayın.",
  ar: "تلقَّ المستجدات عبر البريد الإلكتروني. أكّد عنوانك للاشتراك.",
  he: "קבלו עדכונים בדוא״ל. אשרו את הכתובת כדי להירשם.",
  fa: "تازه‌ها را با ایمیل دریافت کنید. برای اشتراک، نشانی خود را تأیید کنید.",
  hi: "ईमेल से नई जानकारी पाएँ। सदस्यता के लिए अपना पता सत्यापित करें।",
  bn: "ইমেলে নতুন খবর পান। সদস্য হতে আপনার ঠিকানা নিশ্চিত করুন।",
  ta: "புதிய தகவல்களை மின்னஞ்சலில் பெறுங்கள். சந்தா சேர உங்கள் முகவரியை உறுதிப்படுத்துங்கள்.",
  ur: "تازہ معلومات ای میل سے حاصل کریں۔ رکنیت کے لیے اپنا پتا تصدیق کریں۔",
  id: "Terima kabar terbaru lewat email. Konfirmasikan alamat Anda untuk berlangganan.",
  ms: "Terima berita terkini melalui e-mel. Sahkan alamat anda untuk melanggan.",
  vi: "Nhận tin mới qua email. Xác nhận địa chỉ để đăng ký.",
  th: "รับข่าวสารทางอีเมล ยืนยันที่อยู่อีเมลเพื่อสมัครรับข่าวสาร",
  fil: "Tumanggap ng balita sa email. Kumpirmahin ang iyong address para mag-subscribe.",
  ja: "最新情報をメールで受け取れます。登録にはメールアドレスの確認が必要です。",
  ko: "이메일로 새 소식을 받아보세요. 구독하려면 이메일 주소를 확인해 주세요.",
  "zh-Hans": "通过电子邮件接收新消息。确认您的邮箱地址即可订阅。",
  "zh-Hant": "透過電子郵件接收新消息。確認您的信箱地址即可訂閱。",
  sw: "Pokea habari mpya kwa barua pepe. Thibitisha anwani yako ili kujisajili.",
  af: "Ontvang nuus per e-pos. Bevestig jou adres om in te teken.",
};

/** Stable signup copy is independent of the historical experiment catalog. */
export function stableFooterMessages(locale: FooterLocale, audience?: string, productName?: string) {
  const copy = locale.styles.direct;
  const english = /^en(?:-|$)/u.test(locale.locale);
  const language = locale.locale.split("-")[0]!;
  const key = language === "zh" ? (locale.locale.includes("Hant") ? "zh-Hant" : "zh-Hans")
    : language === "sr" ? (locale.locale.includes("Latn") ? "sr-Latn" : "sr-Cyrl") : language;
  return {
    ...copy,
    button: english ? "Get email updates" : copy.formLabel,
    title: english ? "Get email updates" : copy.formLabel,
    description: english && audience === "hraness"
      ? "Get new writing and updates on Hraness projects. Confirm your email to subscribe."
      : english && productName !== undefined
      ? `Get ${productName} updates by email. You're subscribed once you confirm your address.`
      : stableDescriptions[key] ?? stableDescriptions.en!,
    submit: english ? "Subscribe" : copy.button,
    placeholder: "you@example.com",
  };
}
