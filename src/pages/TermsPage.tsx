import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import LegalNavbar from "@/components/layout/LegalNavbar";
import Footer from "@/components/layout/Footer";

const EFFECTIVE_DATE = "2 апреля 2026 г.";
const COMPANY_NAME = "ИП Соколов Сергей Дмитриевич";
const COMPANY_INN = "505029409487";
const COMPANY_ADDRESS = "141131, Россия, Московская обл., г.о. Щёлково, д. Назимиха, д. 38";
const COMPANY_EMAIL = "support@kovallabs.com";
const COMPANY_SITE = "https://kovallabs.com";

interface SectionProps {
  num: string;
  title: string;
  children: React.ReactNode;
}

function Section({ num, title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2
        className="font-display font-bold mb-4 pb-3 border-b flex items-baseline gap-3"
        style={{ fontSize: "1.15rem", color: "var(--dfl-text-hi)", borderColor: "var(--dfl-border-1)" }}
      >
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

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
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

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)", color: "var(--dfl-text-mid)" }}>
      <LegalNavbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
            <Zap size={10} />
            Официальный документ
          </div>
          <h1 className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", color: "var(--dfl-text-hi)", lineHeight: 1.2 }}>
            Условия использования платформы КовальЛабс
          </h1>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Дата вступления в силу: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <div className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", color: "var(--dfl-text-lo)" }}>
            Настоящие Условия использования (далее — «Условия») регулируют отношения между{" "}
            <strong style={{ color: "var(--dfl-text-hi)" }}>{COMPANY_NAME}</strong> (далее — «Компания», «Мы»)
            и пользователями (далее — «Пользователь», «Вы») платформы КовальЛабс (далее — «Платформа»).
            Использование Платформы означает полное и безоговорочное принятие настоящих Условий.
          </div>
        </div>

        {/* 1 */}
        <Section num="1" title="О платформе КовальЛабс">
          <P>1.1. КовальЛабс — SaaS-платформа для создания AI-инфлюенсеров и генерации визуального контента с помощью технологий искусственного интеллекта. Платформа позволяет пользователям создавать уникальных цифровых персонажей (AI-персонажей), генерировать фотографии, видеоролики и motion-контент от их имени.</P>
          <P>1.2. Платформа предназначена для маркетологов, SMM-специалистов, брендов, агентств и предпринимателей, которые хотят создавать AI-контент для социальных сетей, рекламных кампаний и продвижения продуктов без проведения фотосессий и видеосъёмок.</P>
          <P>1.3. Договор между Компанией и Пользователем считается заключённым с момента регистрации учётной записи и принятия настоящих Условий.</P>
          <P>1.4. Настоящие Условия применяются совместно с{" "}
            <Link to="/privacy-policy" style={{ color: "var(--dfl-accent-bright)" }}>Политикой конфиденциальности</Link>,{" "}
            <Link to="/consent" style={{ color: "var(--dfl-accent-bright)" }}>Согласием на обработку данных</Link> и{" "}
            <Link to="/public-offer" style={{ color: "var(--dfl-accent-bright)" }}>Публичной офертой</Link>.
          </P>
        </Section>

        {/* 2 */}
        <Section num="2" title="Регистрация и учётная запись">
          <P>2.1. Для использования Платформы необходимо зарегистрировать учётную запись, указав адрес электронной почты и создав пароль. Регистрация подтверждается одноразовым кодом (OTP), направляемым на указанный email.</P>
          <P>2.2. Регистрация доступна физическим лицам, достигшим 18 лет, и юридическим лицам в соответствии с законодательством РФ.</P>
          <P>2.3. Пользователь несёт ответственность за конфиденциальность учётных данных и все действия, совершённые с использованием его учётной записи.</P>
          <P>2.4. При регистрации на баланс Пользователя начисляется <strong style={{ color: "var(--dfl-text-hi)" }}>500 стартовых кредитов</strong> — внутренней валюты Платформы, которые можно использовать для генерации контента.</P>
          <P>2.5. При выявлении несанкционированного доступа к учётной записи Пользователь обязан незамедлительно уведомить Компанию по адресу{" "}
            <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{COMPANY_EMAIL}</a>.
          </P>
        </Section>

        {/* 3 */}
        <Section num="3" title="Кредитная система и тарифы">
          <P>3.1. Доступ к функциям Платформы осуществляется посредством внутренней расчётной единицы — <strong style={{ color: "var(--dfl-text-hi)" }}>кредитов</strong>. Кредиты не являются электронными денежными средствами и не конвертируются обратно в деньги.</P>
          <P>3.2. Стоимость операций:</P>
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
                  ["Генерация фото (1 фото)", "15 кр"],
                  ["Генерация видео (базовое, 5 с)", "50 кр"],
                  ["Генерация видео (с озвучкой, 5–30 с)", "50–215 кр"],
                  ["Motion Control (5–30 с)", "75–215 кр"],
                ].map(([op, cost], i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--dfl-border-1)" }}>
                    <td className="px-4 py-2.5" style={{ color: "var(--dfl-text-lo)" }}>{op}</td>
                    <td className="px-4 py-2.5 text-right font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>3.3. Тарифные планы:</P>
          <Ul>
            <Li><strong style={{ color: "var(--dfl-text-hi)" }}>Free</strong> — 500 стартовых кредитов единоразово, 1 AI-персонаж, базовые возможности генерации фото.</Li>
            <Li><strong style={{ color: "var(--dfl-text-hi)" }}>Pro</strong> — 3 490 ₽/мес, 1 500 кредитов в месяц, 3 AI-персонажа, генерация видео и Motion Control.</Li>
            <Li><strong style={{ color: "var(--dfl-text-hi)" }}>Studio</strong> — 9 490 ₽/мес, 3 350 кредитов в месяц, 10 AI-персонажей, API-доступ, командная работа.</Li>
          </Ul>
          <P>3.4. Кредиты действительны в течение 12 месяцев с даты последнего пополнения. По истечении срока неиспользованные кредиты аннулируются без возмещения.</P>
          <P>3.5. Возврат денежных средств за приобретённые кредиты осуществляется в случаях, предусмотренных Законом РФ «О защите прав потребителей» № 2300-1, при условии, что кредиты не были использованы. Заявление на возврат направляется на{" "}
            <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{COMPANY_EMAIL}</a> в течение 14 дней с момента покупки.
          </P>
        </Section>

        {/* 4 */}
        <Section num="4" title="Права и обязанности сторон">
          <P><strong style={{ color: "var(--dfl-text-hi)" }}>4.1. Права Пользователя:</strong></P>
          <Ul>
            <Li>Использовать Платформу в соответствии с выбранным тарифом и настоящими Условиями.</Li>
            <Li>Коммерчески использовать сгенерированный контент: публиковать в социальных сетях, использовать в рекламных кампаниях, включать в маркетинговые материалы.</Li>
            <Li>Получать техническую поддержку по адресу <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{COMPANY_EMAIL}</a>.</Li>
            <Li>Запрашивать удаление учётной записи и персональных данных.</Li>
          </Ul>
          <P className="mt-3"><strong style={{ color: "var(--dfl-text-hi)" }}>4.2. Обязанности Пользователя:</strong></P>
          <Ul>
            <Li>Соблюдать настоящие Условия и применимое законодательство Российской Федерации.</Li>
            <Li>Не нарушать права третьих лиц, включая права на интеллектуальную собственность.</Li>
            <Li>Не использовать Платформу для создания запрещённого контента (раздел 5).</Li>
            <Li>Своевременно оплачивать выбранный тариф.</Li>
            <Li>Не осуществлять несанкционированный доступ к Платформе, обходить системы защиты или пытаться реверс-инжинирингом воспроизвести алгоритмы генерации.</Li>
          </Ul>
          <P className="mt-3"><strong style={{ color: "var(--dfl-text-hi)" }}>4.3. Обязательства Компании:</strong></P>
          <Ul>
            <Li>Обеспечивать доступность Платформы не менее 95% времени в месяц (не считая плановых технических работ).</Li>
            <Li>Хранить персональные данные Пользователя в соответствии с ФЗ-152 и Политикой конфиденциальности.</Li>
            <Li>Уведомлять Пользователя об изменениях Условий не менее чем за 10 дней до их вступления в силу.</Li>
            <Li>Оказывать техническую поддержку в рабочие дни в течение 1–2 рабочих дней.</Li>
          </Ul>
        </Section>

        {/* 5 */}
        <Section num="5" title="Запрещённый контент и ограничения использования">
          <P>Пользователю категорически запрещается использовать Платформу для создания, распространения или хранения:</P>
          <Ul>
            <Li>Контента, нарушающего законодательство Российской Федерации: материалов с пропагандой насилия, экстремизма, терроризма.</Li>
            <Li>Сексуального контента с участием несовершеннолетних (ст. 242.1 УК РФ).</Li>
            <Li>Дипфейков реальных людей без их письменного согласия — синтетических видео или изображений, которые могут ввести в заблуждение относительно личности реального человека.</Li>
            <Li>Контента, нарушающего честь, достоинство и деловую репутацию третьих лиц (ст. 152 ГК РФ).</Li>
            <Li>Спама, фишинговых материалов, вредоносных программ и любых средств кибератак.</Li>
            <Li>Контента, нарушающего исключительные права третьих лиц на объекты интеллектуальной собственности.</Li>
          </Ul>
          <P>При выявлении нарушений Компания вправе незамедлительно заблокировать учётную запись без уведомления и без возврата кредитов.</P>
        </Section>

        {/* 6 */}
        <Section num="6" title="Интеллектуальная собственность и права на контент">
          <P>6.1. Все права на Платформу, программный код, алгоритмы, интерфейс и товарные знаки принадлежат Компании и охраняются законодательством РФ (ч. IV ГК РФ).</P>
          <P>6.2. Созданные Пользователем AI-персонажи (настройки, описания, бренд-брифы) остаются интеллектуальной собственностью Пользователя. Компания не претендует на права на персонажей, созданных пользователем.</P>
          <P>6.3. Сгенерированный Платформой контент (фото, видео, motion) передаётся Пользователю на условиях неисключительной лицензии для коммерческого использования без ограничения срока и территории: публикация в социальных сетях, рекламные кампании, маркетинговые материалы.</P>
          <P>6.4. Запрещается: перепродажа AI-персонажей третьим лицам без письменного согласия Компании; использование контента для обучения конкурирующих моделей ИИ.</P>
          <P>6.5. Пользователь гарантирует, что загружаемые им исходные материалы (фотографии для референса, тексты) не нарушают права третьих лиц.</P>
        </Section>

        {/* 7 */}
        <Section num="7" title="Ответственность сторон">
          <P>7.1. Платформа предоставляется «как есть» (as is). Компания не гарантирует, что сгенерированный контент будет соответствовать ожиданиям Пользователя, достигать коммерческих результатов или не нарушать права третьих лиц, если нарушение обусловлено исходными данными Пользователя.</P>
          <P>7.2. Совокупная ответственность Компании ограничена суммой платежей Пользователя за последние 3 месяца.</P>
          <P>7.3. Пользователь несёт полную ответственность за законность использования сгенерированного контента: соответствие рекламному законодательству, авторским правам и иным нормам.</P>
          <P>7.4. Компания не несёт ответственности за перебои в работе Платформы, вызванные форс-мажором, действиями третьих сторон или государственных органов.</P>
        </Section>

        {/* 8 */}
        <Section num="8" title="Разрешение споров">
          <P>8.1. Настоящие Условия регулируются законодательством Российской Федерации.</P>
          <P>8.2. При возникновении споров стороны обязуются решить их путём переговоров. Претензия направляется на{" "}
            <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{COMPANY_EMAIL}</a>.
          </P>
          <P>8.3. Срок рассмотрения претензии — 30 (тридцать) календарных дней.</P>
          <P>8.4. При недостижении соглашения спор передаётся в суд по месту нахождения Компании (Московская область).</P>
          <P>8.5. Споры с физическими лицами — потребителями рассматриваются в судах общей юрисдикции.</P>
        </Section>

        {/* 9 */}
        <Section num="9" title="Изменение условий и расторжение договора">
          <P>9.1. Компания вправе изменять настоящие Условия. Обновлённая версия публикуется по адресу{" "}
            <a href="https://kovallabs.com/terms" style={{ color: "var(--dfl-accent-bright)" }}>kovallabs.com/terms</a> с указанием даты.
          </P>
          <P>9.2. Продолжение использования Платформы после вступления изменений в силу означает согласие Пользователя с новой редакцией.</P>
          <P>9.3. Пользователь вправе в любой момент расторгнуть договор путём удаления учётной записи через настройки аккаунта или по письменному запросу на{" "}
            <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: "var(--dfl-accent-bright)" }}>{COMPANY_EMAIL}</a>.
          </P>
        </Section>

        {/* 10 */}
        <Section num="10" title="Реквизиты компании">
          <div className="rounded-2xl p-5 space-y-2.5 text-sm"
            style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}>
            {[
              ["Наименование", "Индивидуальный предприниматель Соколов Сергей Дмитриевич"],
              ["ИНН", COMPANY_INN],
              ["ОГРНИП", "324508100007100"],
              ["Юридический адрес", COMPANY_ADDRESS],
              ["Электронная почта", COMPANY_EMAIL],
              ["Сайт", COMPANY_SITE],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4">
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
          <p>Условия составлены в соответствии с ГК РФ, ФЗ-152 «О персональных данных», Законом РФ «О защите прав потребителей» № 2300-1.</p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <Link to="/privacy-policy" style={{ color: "var(--dfl-accent-bright)" }}>Политика конфиденциальности</Link>
            <span style={{ color: "var(--dfl-border-2)" }}>·</span>
            <Link to="/consent" style={{ color: "var(--dfl-accent-bright)" }}>Согласие на обработку данных</Link>
            <span style={{ color: "var(--dfl-border-2)" }}>·</span>
            <Link to="/public-offer" style={{ color: "var(--dfl-accent-bright)" }}>Публичная оферта</Link>
            <span style={{ color: "var(--dfl-border-2)" }}>·</span>
            <Link to="/eula" style={{ color: "var(--dfl-accent-bright)" }}>EULA</Link>
          </div>
          <p className="mt-3" style={{ color: "var(--dfl-text-placeholder)" }}>
            © 2026 {COMPANY_NAME}. Все права защищены.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
