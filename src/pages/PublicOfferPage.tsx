import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import LegalNavbar from "@/components/layout/LegalNavbar";

const EFFECTIVE_DATE = "2 апреля 2026 г.";
const IP_FULL = "Индивидуальный предприниматель Соколов Сергей Дмитриевич";
const IP_SHORT = "ИП Соколов С.Д.";
const INN = "505029409487";
const OGRNIP = "324508100007100";
const ADDRESS = "141131, Россия, Московская обл., г.о. Щёлково, д. Назимиха, д. 38";
const EMAIL = "support@kovallabs.com";
const SITE = "https://kovallabs.com";

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-bold mb-4 pb-3 border-b flex items-baseline gap-3"
        style={{ fontSize: "1.1rem", color: "var(--dfl-text-hi)", borderColor: "var(--dfl-border-1)" }}>
        <span className="text-sm font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
          style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
          {num}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--dfl-text-mid)" }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--dfl-accent-bright)" }} />
      <span>{children}</span>
    </li>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 pl-1">{children}</ul>;
}

export default function PublicOfferPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)", color: "var(--dfl-text-mid)" }}>
      <LegalNavbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
            <FileText size={10} />
            Официальный документ
          </div>
          <h1 className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--dfl-text-hi)", lineHeight: 1.2 }}>
            Публичная оферта на оказание услуг
          </h1>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Дата вступления в силу: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <div className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", color: "var(--dfl-text-lo)" }}>
            Настоящий документ является публичной офертой{" "}
            <strong style={{ color: "var(--dfl-text-hi)" }}>{IP_FULL}</strong> (далее — «Исполнитель»),
            адресованной физическим и юридическим лицам (далее — «Заказчик»). Акцепт оферты происходит
            в момент регистрации учётной записи и/или оплаты услуг платформы КовальЛабс.
          </div>
        </div>

        <Section num="1" title="Предмет оферты и описание услуг">
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>КовальЛабс</strong> — SaaS-платформа для создания AI-инфлюенсеров и генерации визуального контента. Платформа позволяет:</P>
          <Ul>
            <Li>Создавать уникальных цифровых персонажей (AI-персонажей) с настраиваемыми характеристиками, внешностью и голосом бренда.</Li>
            <Li>Генерировать фотографии AI-персонажа в различных сценах, стилях и форматах.</Li>
            <Li>Создавать видеоролики (короткие видео для TikTok, Reels, YouTube Shorts) с участием AI-персонажа.</Li>
            <Li>Создавать motion-контент с анимацией и движением AI-персонажа.</Li>
            <Li>Управлять бренд-брифом (TOV, целевая аудитория, ценности бренда, ограничения контента).</Li>
            <Li>Хранить историю генераций и галерею контента в личном кабинете.</Li>
          </Ul>
          <P>1.2. Услуги оказываются дистанционно посредством предоставления доступа к Платформе через интернет.</P>
          <P>1.3. Исполнитель не выступает автором созданных AI-персонажей — они формируются на основании данных Заказчика.</P>
        </Section>

        <Section num="2" title="Термины и определения">
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>AI-персонаж</strong> — уникальный цифровой инфлюенсер, созданный Заказчиком с использованием инструментов Платформы. Включает внешность, стиль, голос бренда и настройки генерации.</P>
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>Кредиты</strong> — внутренние расчётные единицы Платформы, используемые для оплаты операций генерации контента. Не являются электронными деньгами.</P>
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>Промпт</strong> — текстовое описание, которое Заказчик вводит для генерации конкретного изображения или видео.</P>
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>Тариф</strong> — набор условий (объём кредитов, количество AI-персонажей, доступные функции), выбираемый Заказчиком.</P>
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>Акцепт</strong> — полное принятие условий оферты путём регистрации и/или оплаты.</P>
        </Section>

        <Section num="3" title="Порядок акцепта оферты">
          <P>3.1. Акцептом являются следующие действия Заказчика:</P>
          <Ul>
            <Li>Регистрация учётной записи путём подтверждения email-адреса через OTP-код.</Li>
            <Li>Оплата любого тарифного плана или пакета кредитов.</Li>
            <Li>Активное использование функций генерации контента.</Li>
          </Ul>
          <P>3.2. Акцептуя оферту, Заказчик подтверждает, что ознакомлен с условиями и является дееспособным лицом старше 18 лет или уполномоченным представителем юридического лица.</P>
          <P>3.3. Договор действует бессрочно до удаления учётной записи или расторжения.</P>
        </Section>

        <Section num="4" title="Стоимость услуг и кредитная система">
          <P>4.1. Услуги оплачиваются через систему кредитов. Стоимость операций:</P>
          <div className="rounded-xl overflow-hidden border text-xs" style={{ borderColor: "var(--dfl-border-1)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--dfl-surface-2)" }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "var(--dfl-text-hi)" }}>Операция</th>
                  <th className="text-right px-4 py-2.5 font-semibold" style={{ color: "var(--dfl-text-hi)" }}>Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Генерация фото", "15 кр"],
                  ["Видео (5 с, без звука)", "50 кр"],
                  ["Видео (до 30 с, с озвучкой)", "215 кр"],
                  ["Motion Control (5 с)", "75 кр"],
                  ["Motion Control (до 30 с)", "215 кр"],
                ].map(([op, cost], i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--dfl-border-1)" }}>
                    <td className="px-4 py-2.5" style={{ color: "var(--dfl-text-lo)" }}>{op}</td>
                    <td className="px-4 py-2.5 text-right font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>4.2. Тарифные планы (ежемесячная оплата в рублях РФ):</P>
          <Ul>
            <Li><strong>Free</strong> — бесплатно, 500 стартовых кредитов единоразово.</Li>
            <Li><strong>Pro</strong> — 3 490 ₽/мес (ежегодно — 2 790 ₽/мес), 1 500 кредитов/мес.</Li>
            <Li><strong>Studio</strong> — 9 490 ₽/мес (ежегодно — 7 590 ₽/мес), 3 350 кредитов/мес.</Li>
          </Ul>
          <P>4.3. Пакеты дополнительных кредитов (разовая покупка): от 690 ₽ (300 кр) до 14 990 ₽ (12 000 кр). Актуальные цены на <Link to="/pricing" style={{ color: "var(--dfl-accent-bright)" }}>kovallabs.com/pricing</Link>.</P>
          <P>4.4. НДС: {IP_SHORT} применяет УСН. НДС в стоимость не включён.</P>
          <P>4.5. Кредиты действительны 12 месяцев с даты последнего пополнения. Неиспользованные кредиты по истечении срока аннулируются без возмещения.</P>
          <P>4.6. Исполнитель вправе изменять тарифы с уведомлением за 10 дней через личный кабинет или email.</P>
        </Section>

        <Section num="5" title="Права и обязанности сторон">
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>5.1. Исполнитель обязуется:</strong></P>
          <Ul>
            <Li>Обеспечивать доступность Платформы не менее 95% в месяц (кроме плановых технических работ).</Li>
            <Li>Обрабатывать данные Заказчика в соответствии с ФЗ-152 и Политикой конфиденциальности.</Li>
            <Li>Оказывать техническую поддержку на <a href={`mailto:${EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{EMAIL}</a> в течение 2 рабочих дней.</Li>
          </Ul>
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>5.2. Заказчик обязуется:</strong></P>
          <Ul>
            <Li>Использовать Платформу только в законных целях и не создавать запрещённый контент.</Li>
            <Li>Не создавать дипфейки реальных людей без их письменного согласия.</Li>
            <Li>Своевременно оплачивать выбранный тариф.</Li>
            <Li>Не обходить технические ограничения Платформы и не пытаться реверс-инжинирингом воспроизвести алгоритмы.</Li>
          </Ul>
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>5.3. Права на сгенерированный контент:</strong></P>
          <P>Заказчик получает неисключительную лицензию на коммерческое использование сгенерированного контента: публикация в социальных сетях, рекламные кампании, маркетинговые материалы — без ограничения срока и территории.</P>
        </Section>

        <Section num="6" title="Ответственность и ограничения">
          <P>6.1. Совокупная ответственность Исполнителя ограничена суммой платежей Заказчика за последние 3 месяца.</P>
          <P>6.2. Исполнитель не несёт ответственности за коммерческий успех созданного контента, его соответствие алгоритмам социальных сетей или требованиям рекламных платформ.</P>
          <P>6.3. Заказчик несёт полную ответственность за законность использования контента: соответствие ФЗ «О рекламе», авторским правам и иным нормам.</P>
          <P>6.4. Исполнитель не отвечает за сбои вследствие форс-мажора, действий третьих сторон или государственных органов.</P>
        </Section>

        <Section num="7" title="Расторжение и возврат средств">
          <P>7.1. Заказчик вправе расторгнуть договор путём удаления учётной записи через настройки или по запросу на <a href={`mailto:${EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{EMAIL}</a>.</P>
          <P>7.2. При расторжении неиспользованные кредиты аннулируются без возмещения, если иное не предусмотрено законодательством РФ о защите прав потребителей.</P>
          <P>7.3. Возврат за неиспользованные кредиты возможен в течение 14 дней с момента покупки при условии, что они не были использованы, по письменному заявлению на {EMAIL}.</P>
          <P>7.4. Исполнитель вправе расторгнуть договор при нарушении Заказчиком Условий использования, уведомив за 3 рабочих дня (немедленно при грубых нарушениях).</P>
        </Section>

        <Section num="8" title="Претензионный порядок и споры">
          <P>8.1. Претензии направляются на <a href={`mailto:${EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{EMAIL}</a> с описанием сути требования.</P>
          <P>8.2. Срок рассмотрения — 30 календарных дней.</P>
          <P>8.3. При недостижении соглашения спор передаётся в суд по месту нахождения Исполнителя (Московская область).</P>
        </Section>

        <Section num="9" title="Реквизиты Исполнителя">
          <div className="rounded-2xl p-5 space-y-2.5 text-sm"
            style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}>
            {[
              ["Наименование", IP_FULL],
              ["ИНН", INN],
              ["ОГРНИП", OGRNIP],
              ["Адрес регистрации", ADDRESS],
              ["Электронная почта", EMAIL],
              ["Сайт", SITE],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 flex-wrap">
                <span className="flex-shrink-0 font-medium" style={{ color: "var(--dfl-text-subtle)", minWidth: 180 }}>{label}:</span>
                <span style={{ color: "var(--dfl-text-hi)" }}>
                  {label === "Электронная почта" ? (
                    <a href={`mailto:${value}`} style={{ color: "var(--dfl-accent-bright)" }}>{value}</a>
                  ) : label === "Сайт" ? (
                    <a href={value} style={{ color: "var(--dfl-accent-bright)" }}>{value}</a>
                  ) : value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-8 pt-6 border-t text-xs text-center"
          style={{ borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}>
          <p>Оферта составлена в соответствии со ст. 435–437 ГК РФ.</p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {[
              { label: "Условия использования", to: "/terms" },
              { label: "Политика конфиденциальности", to: "/privacy-policy" },
              { label: "Политика cookies", to: "/cookie-policy" },
              { label: "EULA", to: "/eula" },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{ color: "var(--dfl-accent-bright)" }}>{l.label}</Link>
            ))}
          </div>
          <p className="mt-3" style={{ color: "var(--dfl-text-placeholder)" }}>
            © 2026 {IP_FULL}. Все права защищены.
          </p>
        </div>
      </main>
    </div>
  );
}
