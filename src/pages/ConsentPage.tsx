import { useEffect } from "react";
import { FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import LegalNavbar from "@/components/layout/LegalNavbar";
import Footer from "@/components/layout/Footer";

const OPERATOR = "КовальЛабс";
const SITE_URL = "https://kovallabs.com";
const CONTACT_EMAIL = "support@kovallabs.com";
const EFFECTIVE_DATE = "2 апреля 2026 года";

export default function ConsentPage() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = "Согласие на обработку персональных данных — КовальЛабс";
  }, []);

  return (
    <div style={{ background: "var(--dfl-bg)", minHeight: "100vh" }}>
      <LegalNavbar />

      <main className="pt-8 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          <div className="flex items-start gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
              style={{ background: "var(--dfl-success-muted)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <FileCheck size={22} style={{ color: "var(--dfl-success)" }} />
            </div>
            <div>
              <h1 className="font-display font-bold mb-2"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--dfl-text-hi)" }}>
                Согласие на обработку персональных данных
              </h1>
              <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                Дата вступления в силу: {EFFECTIVE_DATE}
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-10"
            style={{ background: "var(--dfl-accent-muted-2)", border: "1px solid var(--dfl-border-2)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
              Настоящий документ — форма Согласия на обработку персональных данных в соответствии со ст. 9
              ФЗ-152 «О персональных данных». Проставляя отметку при регистрации на платформе КовальЛабс,
              вы даёте информированное и добровольное согласие на условиях ниже.
            </p>
          </div>

          <div className="space-y-8">

            <div className="rounded-2xl p-6"
              style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-mid)" }}>
                Я, субъект персональных данных (далее — «Субъект»), свободно, своей волей и в своём интересе
                даю согласие <strong style={{ color: "var(--dfl-text-hi)" }}>{OPERATOR}</strong> (ИП Соколов С.Д.,
                ИНН 505029409487), сайт <a href={SITE_URL}>{SITE_URL}</a>, на обработку следующих данных:
              </p>
            </div>

            <Section number="1" title="Состав персональных данных">
              <p>Субъект даёт согласие на обработку:</p>
              <div className="mt-4 space-y-2">
                {[
                  "Email-адрес и имя пользователя (имя аккаунта).",
                  "Загружаемые референсные изображения для создания AI-персонажа.",
                  "Текстовые описания (промпты) для генерации контента.",
                  "Настройки AI-персонажей и бренд-брифы (TOV, аудитория, ценности бренда).",
                  "История генераций: запросы, сгенерированные фото, видео, motion-контент.",
                  "Технические данные: IP-адрес, тип браузера, устройство, страна, данные о сессиях.",
                  "История транзакций кредитов и платёжных операций.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3"
                    style={{ background: "var(--dfl-accent-muted-2)", border: "1px solid var(--dfl-border-2)" }}>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: "var(--dfl-accent-muted)", color: "var(--dfl-accent-bright)" }}>
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section number="2" title="Цели обработки">
              <p>Обработка данных осуществляется исключительно в целях:</p>
              <ol>
                <li>Регистрации и аутентификации на Платформе КовальЛабс.</li>
                <li>Создания AI-персонажей и генерации визуального контента (фото, видео, motion).</li>
                <li>Хранения истории генераций и галереи контента в личном кабинете.</li>
                <li>Управления балансом кредитов и обработки платёжных транзакций.</li>
                <li>Отправки транзакционных email-уведомлений: OTP-коды, статусы генерации, изменения аккаунта.</li>
                <li>Технической поддержки через систему тикетов.</li>
                <li>Обеспечения безопасности Платформы и предотвращения мошенничества.</li>
                <li>Информирования о новых функциях и обновлениях Платформы (при наличии отдельного согласия на маркетинг).</li>
              </ol>
            </Section>

            <Section number="3" title="Действия с данными">
              <p>Оператор вправе совершать следующие действия:</p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Сбор", "Запись", "Систематизация", "Хранение", "Уточнение", "Использование",
                  "Передача партнёрам", "Обезличивание", "Блокирование", "Уничтожение"].map((action) => (
                  <div key={action} className="text-xs text-center py-2 px-3 rounded-lg"
                    style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)", color: "var(--dfl-text-mid)" }}>
                    {action}
                  </div>
                ))}
              </div>
              <p className="mt-4">
                Обработка осуществляется <strong>с использованием средств автоматизации</strong> через защищённую
                облачную инфраструктуру.
              </p>
            </Section>

            <Section number="4" title="Передача третьим лицам">
              <p>
                Данные могут передаваться техническим партнёрам для обеспечения функций Платформы:
              </p>
              <ul>
                <li><strong style={{ color: "var(--dfl-text-hi)" }}>Timeweb Cloud</strong> — облачная инфраструктура размещения серверной части, базы данных и объектного S3-хранилища. Аутентификация выполняется собственной серверной частью Платформы.</li>
                <li><strong style={{ color: "var(--dfl-text-hi)" }}>OpenRouter.ai</strong> — API для AI-генерации (промпты обрабатываются для создания контента).</li>
                <li><strong style={{ color: "var(--dfl-text-hi)" }}>SMTP-провайдер</strong> — доставка email-уведомлений.</li>
                <li><strong style={{ color: "var(--dfl-text-hi)" }}>Платёжные провайдеры</strong> — обработка платежей.</li>
              </ul>
              <p>Все партнёры заключают договоры о конфиденциальности и соблюдают требования ФЗ-152.</p>
            </Section>

            <Section number="5" title="Срок действия Согласия">
              <p>
                Согласие действует с момента его предоставления (проставления отметки при регистрации)
                до удаления учётной записи или отзыва Согласия. После отзыва или удаления аккаунта
                данные уничтожаются в течение <strong>30 дней</strong>, кроме случаев, когда хранение
                требуется по законодательству (например, данные транзакций — 5 лет).
              </p>
            </Section>

            <Section number="6" title="Права Субъекта">
              <p>В соответствии с ФЗ-152 вы вправе:</p>
              <ol>
                <li>
                  <strong>Отозвать Согласие</strong> в любое время путём удаления аккаунта или обращения на{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </li>
                <li><strong>Получить информацию</strong> о ваших данных и порядке их обработки.</li>
                <li><strong>Исправить или удалить</strong> неточные или устаревшие данные.</li>
                <li><strong>Обжаловать</strong> действия Оператора в Роскомнадзор (rkn.gov.ru).</li>
              </ol>
              <div className="mt-4 rounded-xl p-4"
                style={{ background: "var(--dfl-warning-muted)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="text-sm" style={{ color: "var(--dfl-text-lo)" }}>
                  <strong style={{ color: "var(--dfl-warning)" }}>Внимание:</strong> отзыв Согласия может повлечь
                  ограничение доступа к функциям Платформы, требующим обработки данных. Некоторые данные могут
                  продолжать обрабатываться на иных правовых основаниях (ст. 6 ч. 1 пп. 2–11 ФЗ-152).
                </p>
              </div>
            </Section>

            <div className="rounded-2xl p-6"
              style={{ background: "var(--dfl-success-muted)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <h3 className="font-display font-semibold mb-3"
                style={{ color: "var(--dfl-success)", fontSize: "0.95rem" }}>
                Подтверждение Согласия
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
                Проставляя отметку при регистрации на <a href={SITE_URL}>{SITE_URL}</a>, Субъект подтверждает, что:
              </p>
              <ul className="mt-3 space-y-1.5 text-sm" style={{ color: "var(--dfl-text-lo)" }}>
                <li>ознакомлен(а) с настоящим Согласием и{" "}
                  <Link to="/privacy-policy" className="underline underline-offset-2" style={{ color: "var(--dfl-accent-bright)" }}>
                    Политикой конфиденциальности
                  </Link>{" "}КовальЛабс;
                </li>
                <li>является дееспособным физическим лицом, достигшим 18 лет;</li>
                <li>даёт Согласие добровольно и осознанно.</li>
              </ul>
            </div>

          </div>

          <div className="mt-14 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderTop: "1px solid var(--dfl-border-1)" }}>
            <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
              Редакция от {EFFECTIVE_DATE}. Оператор: {OPERATOR}.
            </p>
            <Link to="/privacy-policy" className="transition-colors duration-150 underline underline-offset-2 text-sm"
              style={{ color: "var(--dfl-accent-bright)" }}>
              ← Политика конфиденциальности
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold mb-5 pb-3"
        style={{ fontSize: "1.1rem", color: "var(--dfl-text-hi)", borderBottom: "1px solid var(--dfl-border-1)" }}>
        <span className="inline-block mr-3 px-2 py-0.5 rounded-lg text-xs font-bold"
          style={{ background: "var(--dfl-success-muted)", border: "1px solid rgba(34,197,94,0.25)", color: "var(--dfl-success)" }}>
          {number}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
        {children}
      </div>
    </section>
  );
}
