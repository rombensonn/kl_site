import { useEffect } from "react";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import LegalNavbar from "@/components/layout/LegalNavbar";
import Footer from "@/components/layout/Footer";

const OPERATOR = "ИП Соколов Сергей Дмитриевич";
const SITE_URL = "https://kovallabs.com";
const CONTACT_EMAIL = "support@kovallabs.com";
const EFFECTIVE_DATE = "2 апреля 2026 года";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = "Политика конфиденциальности — КовальЛабс";
  }, []);

  return (
    <div style={{ background: "var(--dfl-bg)", minHeight: "100vh" }}>
      <LegalNavbar />

      <main className="pt-8 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          <div className="flex items-start gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
              style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)" }}>
              <Shield size={22} style={{ color: "var(--dfl-accent-bright)" }} />
            </div>
            <div>
              <h1 className="font-display font-bold mb-2"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--dfl-text-hi)" }}>
                Политика конфиденциальности
              </h1>
              <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                Дата вступления в силу: {EFFECTIVE_DATE}
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-10"
            style={{ background: "var(--dfl-accent-muted-2)", border: "1px solid var(--dfl-border-2)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
              Настоящая Политика описывает, какие данные собирает КовальЛабс при использовании платформы
              для создания AI-инфлюенсеров и генерации контента, как мы их обрабатываем и защищаем.
              Документ разработан в соответствии с ФЗ-152 «О персональных данных».
            </p>
          </div>

          <div className="space-y-10">

            <Section number="1" title="Оператор персональных данных">
              <p>
                Оператором является <strong>Индивидуальный предприниматель Соколов Сергей Дмитриевич</strong>,
                владелец платформы КовальЛабс ({SITE_URL}).
              </p>
              <ul>
                <li>ИНН: 505029409487 · ОГРНИП: 324508100007100</li>
                <li>Адрес: 141131, Россия, Московская обл., г.о. Щёлково, д. Назимиха, д. 38</li>
                <li>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              </ul>
            </Section>

            <Section number="2" title="Какие данные мы собираем">
              <p>КовальЛабс собирает данные, необходимые для работы платформы AI-инфлюенсеров:</p>
              <dl className="space-y-3">
                <DlItem term="Регистрационные данные">
                  Email-адрес, имя пользователя, пароль (в зашифрованном виде).
                </DlItem>
                <DlItem term="Данные аккаунта">
                  История генераций (промпты, сгенерированные фото/видео), настройки AI-персонажей,
                  бренд-брифы (TOV, аудитория, ценности бренда), баланс кредитов и история транзакций.
                </DlItem>
                <DlItem term="Загружаемые материалы">
                  Референсные изображения, которые Пользователь загружает для создания AI-персонажа.
                  Хранятся в защищённом облачном хранилище.
                </DlItem>
                <DlItem term="Технические данные">
                  IP-адрес, тип браузера и устройства, страна и часовой пояс, данные о сессиях
                  и активности на Платформе.
                </DlItem>
                <DlItem term="Платёжные данные">
                  Мы не храним данные банковских карт. Платёжная информация обрабатывается
                  сторонними провайдерами (ЮKassa, ЮМани) в соответствии с PCI DSS.
                </DlItem>
              </dl>
            </Section>

            <Section number="3" title="Цели обработки данных">
              <p>Мы обрабатываем данные исключительно в следующих целях:</p>
              <ol>
                <li>Предоставление доступа к Платформе и её функциям (генерация фото, видео, motion-контента).</li>
                <li>Создание и хранение AI-персонажей Пользователя, управление бренд-брифами.</li>
                <li>Обработка транзакций кредитов, учёт баланса и истории генераций.</li>
                <li>Отправка уведомлений о статусе генерации, новых функциях и обновлениях Платформы.</li>
                <li>Техническая поддержка пользователей через систему тикетов.</li>
                <li>Защита от мошенничества и злоупотреблений на Платформе.</li>
                <li>Соблюдение требований законодательства Российской Федерации.</li>
              </ol>
            </Section>

            <Section number="4" title="Правовые основания обработки">
              <ul>
                <li><strong>Согласие Пользователя</strong> — ст. 9 ФЗ-152 (при регистрации и заполнении форм).</li>
                <li><strong>Исполнение договора</strong> — ст. 6 ч. 1 п. 5 ФЗ-152 (предоставление услуг Платформы).</li>
                <li><strong>Законные интересы</strong> — ст. 6 ч. 1 п. 7 ФЗ-152 (безопасность, защита от мошенничества, аналитика качества).</li>
                <li><strong>Требования законодательства</strong> — ст. 6 ч. 1 п. 2 ФЗ-152.</li>
              </ul>
            </Section>

            <Section number="5" title="Хранение и безопасность данных">
              <p>Мы принимаем следующие меры по защите данных:</p>
              <ul>
                <li>Передача данных только по защищённому протоколу HTTPS/TLS.</li>
                <li>Пароли хранятся в зашифрованном виде (bcrypt), никогда не передаются в открытом виде.</li>
                <li>Хранилище генераций (фото, видео) доступно только авторизованному Пользователю через серверную проверку сессии и прав доступа.</li>
                <li>Персональные данные граждан РФ хранятся на серверах, расположенных на территории РФ (ст. 18.1 ФЗ-152).</li>
                <li>Доступ к данным ограничен по принципу минимальных привилегий.</li>
              </ul>
              <p>Сроки хранения:</p>
              <ul>
                <li>Данные учётной записи — до удаления аккаунта + 30 дней.</li>
                <li>История генераций — до удаления аккаунта.</li>
                <li>Технические логи — не более 1 года.</li>
                <li>Данные платёжных транзакций — 5 лет (требования налогового законодательства).</li>
              </ul>
            </Section>

            <Section number="6" title="Передача данных третьим лицам">
              <p>КовальЛабс не продаёт и не передаёт ваши данные третьим лицам в коммерческих целях.</p>
              <p>Мы привлекаем технических партнёров только для обеспечения работы Платформы:</p>
              <ul>
                <li><strong>Timeweb Cloud</strong> — облачная инфраструктура размещения серверной части, базы данных и объектного S3-хранилища. Аутентификация и управление сессиями выполняются собственной серверной частью Платформы.</li>
                <li><strong>OpenRouter.ai</strong> — API для AI-генерации изображений и видео (промпты передаются для обработки).</li>
                <li><strong>SMTP-провайдер</strong> — отправка транзакционных писем (OTP, уведомления).</li>
                <li><strong>Платёжные провайдеры</strong> — обработка платежей без хранения данных карт нами.</li>
              </ul>
              <p>Все партнёры обязаны соблюдать конфиденциальность данных в соответствии с договорами поручения обработки.</p>
            </Section>

            <Section number="7" title="Права пользователя">
              <p>В соответствии с ФЗ-152 вы имеете право:</p>
              <ol>
                <li><strong>Доступ</strong> — запросить информацию о ваших данных, хранимых на Платформе.</li>
                <li><strong>Исправление</strong> — обновить неточные данные в разделе «Настройки» или по запросу.</li>
                <li><strong>Удаление</strong> — удалить аккаунт и все связанные данные через «Настройки» или по запросу.</li>
                <li><strong>Отзыв согласия</strong> — в любое время направив запрос на <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</li>
                <li><strong>Экспорт</strong> — запросить ваши данные в машиночитаемом формате.</li>
                <li><strong>Жалоба</strong> — обратиться в Роскомнадзор (rkn.gov.ru) при нарушении ваших прав.</li>
              </ol>
              <p>Срок рассмотрения обращений — <strong>30 дней</strong>.</p>
            </Section>

            <Section number="8" title="Cookie и аналитика">
              <p>
                Платформа использует cookie для аутентификации, сохранения пользовательских настроек (тема оформления)
                и базовой аналитики посещаемости. Подробнее в{" "}
                <Link to="/cookie-policy" style={{ color: "var(--dfl-accent-bright)" }}>Политике Cookie</Link>.
              </p>
              <p>
                Мы не используем сторонние рекламные трекеры и не передаём данные о поведении пользователей
                рекламным платформам.
              </p>
            </Section>

            <Section number="9" title="AI-генерация и промпты">
              <p>
                Текстовые описания (промпты), которые вы вводите для генерации контента, передаются сторонним
                AI-провайдерам через API для обработки. Мы рекомендуем не включать в промпты личные данные,
                данные третьих лиц или конфиденциальную информацию.
              </p>
              <p>
                Загружаемые референсные изображения хранятся в вашем персональном хранилище и доступны
                только вам. Мы не используем ваши референсные изображения для обучения собственных AI-моделей.
              </p>
            </Section>

            <Section number="10" title="Изменение Политики">
              <p>
                Мы вправе обновлять настоящую Политику. Актуальная версия всегда доступна по адресу{" "}
                <a href={`${SITE_URL}/privacy-policy`}>{SITE_URL}/privacy-policy</a>.
                При существенных изменениях мы уведомим вас по email.
              </p>
            </Section>

          </div>

          <div className="mt-14 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderTop: "1px solid var(--dfl-border-1)" }}>
            <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
              Редакция от {EFFECTIVE_DATE}. {OPERATOR}. ИНН 505029409487.
            </p>
            <div className="flex gap-4 text-sm">
              <Link to="/consent" className="transition-colors duration-150 underline underline-offset-2"
                style={{ color: "var(--dfl-accent-bright)" }}>
                Согласие на обработку данных →
              </Link>
            </div>
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
          style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
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

function DlItem({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold mb-0.5" style={{ color: "var(--dfl-text-mid)" }}>{term}</dt>
      <dd style={{ color: "var(--dfl-text-lo)" }}>{children}</dd>
    </div>
  );
}
