import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import LegalNavbar from "@/components/layout/LegalNavbar";

const EFFECTIVE_DATE = "2 апреля 2026 г.";
const IP_FULL = "Индивидуальный предприниматель Соколов Сергей Дмитриевич";
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

export default function EulaPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)", color: "var(--dfl-text-mid)" }}>
      <LegalNavbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
            <Lock size={10} />
            Лицензионное соглашение с конечным пользователем
          </div>
          <h1 className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--dfl-text-hi)", lineHeight: 1.2 }}>
            Лицензионное соглашение (EULA)
          </h1>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Дата вступления в силу: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <div className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", color: "var(--dfl-text-lo)" }}>
            Настоящее EULA заключается между <strong style={{ color: "var(--dfl-text-hi)" }}>{IP_FULL}</strong> (Лицензиар)
            и вами (Лицензиат). Используя платформу КовальЛабс — инструмент для создания AI-инфлюенсеров и
            генерации визуального контента — вы принимаете условия настоящего Соглашения.
          </div>
        </div>

        <Section num="1" title="Предмет лицензии">
          <P>1.1. Лицензиар предоставляет Лицензиату ограниченную, отзывную, неисключительную, непередаваемую лицензию на использование платформы КовальЛабс, включая:</P>
          <Ul>
            <Li>Веб-интерфейс для создания и управления AI-персонажами.</Li>
            <Li>Инструменты генерации фото, видео и motion-контента через AI-модели.</Li>
            <Li>Систему управления бренд-брифами и галереей контента.</Li>
            <Li>API-доступ (для тарифа Studio).</Li>
          </Ul>
          <P>1.2. Лицензия не включает право на:</P>
          <Ul>
            <Li>Декомпиляцию, реверс-инжиниринг или копирование программного кода Платформы.</Li>
            <Li>Создание производных программных продуктов на основе Платформы.</Li>
            <Li>Передачу, продажу, аренду или сублицензирование доступа к Платформе третьим лицам.</Li>
            <Li>Использование Платформы для обучения конкурирующих AI-систем без письменного согласия.</Li>
            <Li>Автоматизированный парсинг данных или mass-запросы без разрешения.</Li>
          </Ul>
        </Section>

        <Section num="2" title="Права интеллектуальной собственности">
          <P>2.1. Все права на Платформу, включая алгоритмы генерации, пользовательский интерфейс, модели AI, товарные знаки «КовальЛабс» и визуальную идентику, принадлежат Лицензиару (ч. IV ГК РФ).</P>
          <P>2.2. Лицензиат сохраняет права на исходные материалы, загружаемые на Платформу: референсные изображения, тексты промптов, настройки персонажей. Лицензиат предоставляет Лицензиару право использовать эти материалы исключительно для оказания услуг Платформы.</P>
          <P>2.3. Созданные Лицензиатом AI-персонажи принадлежат Лицензиату. Лицензиар не претендует на права собственности на персонажей.</P>
          <P>2.4. Сгенерированный контент (фото, видео, motion) предоставляется Лицензиату на условиях неисключительной коммерческой лицензии: публикация в социальных сетях, рекламные кампании, маркетинговые материалы — без ограничения срока и территории.</P>
        </Section>

        <Section num="3" title="Ограничения и запреты">
          <P>3.1. Лицензиату запрещается:</P>
          <Ul>
            <Li>Создавать контент, изображающий реальных людей в компрометирующих ситуациях без их явного согласия (дипфейки).</Li>
            <Li>Генерировать контент, нарушающий законодательство РФ: материалы с насилием, экстремизмом, CSAM.</Li>
            <Li>Использовать Платформу в целях мошенничества, создания фейковых аккаунтов или манипуляций в социальных сетях.</Li>
            <Li>Обходить системы защиты Платформы, эксплуатировать уязвимости или организовывать DDoS-атаки.</Li>
            <Li>Перепродавать доступ к Платформе или предоставлять учётные данные третьим лицам.</Li>
          </Ul>
          <P>3.2. Нарушение ограничений влечёт немедленный отзыв лицензии и блокировку аккаунта без возмещения неиспользованных кредитов.</P>
        </Section>

        <Section num="4" title="AI-генерация: важные оговорки">
          <P>4.1. Результаты AI-генерации могут варьироваться в зависимости от промпта, доступных моделей и технических ограничений. Лицензиар не гарантирует точное соответствие результатов ожиданиям Лицензиата.</P>
          <P>4.2. Для генерации контента Платформа использует сторонние AI-модели через API (в том числе OpenRouter.ai). Промпты Лицензиата передаются провайдерам AI в зашифрованном виде исключительно для обработки запросов.</P>
          <P>4.3. Лицензиат несёт ответственность за то, что сгенерированный контент не нарушает права интеллектуальной собственности третьих лиц и соответствует требованиям рекламного законодательства.</P>
          <P>4.4. Лицензиар не гарантирует, что сгенерированный контент будет принят рекламными платформами (Facebook, Google Ads, TikTok) или соответствовать их правилам.</P>
        </Section>

        <Section num="5" title="Обновления и изменения Платформы">
          <P>5.1. Лицензиар вправе обновлять Платформу, изменять AI-модели и функциональность без предварительного уведомления при сохранении ключевых возможностей выбранного тарифа.</P>
          <P>5.2. При существенных изменениях, затрагивающих возможности тарифа, Лицензиар уведомит за 10 дней через личный кабинет или email.</P>
        </Section>

        <Section num="6" title="Гарантии и ответственность">
          <P>6.1. Платформа предоставляется «как есть». Лицензиар не даёт гарантий непрерывной работы, отсутствия ошибок или соответствия конкретным коммерческим целям Лицензиата.</P>
          <P>6.2. Совокупная ответственность Лицензиара ограничена суммой платежей Лицензиата за последние 3 месяца.</P>
        </Section>

        <Section num="7" title="Прекращение лицензии">
          <P>7.1. Лицензиат вправе прекратить использование Платформы и удалить учётную запись в любое время.</P>
          <P>7.2. Лицензиар вправе отозвать лицензию при нарушении настоящего Соглашения с уведомлением по email.</P>
          <P>7.3. После прекращения лицензии доступ к Платформе закрывается. Контент, ранее экспортированный Лицензиатом, может использоваться им в соответствии с ранее предоставленными правами.</P>
        </Section>

        <Section num="8" title="Применимое право">
          <P>8.1. Соглашение регулируется законодательством РФ, в том числе ГК РФ (ч. IV), ФЗ-149 «Об информации» и ФЗ-152 «О персональных данных».</P>
          <P>8.2. Споры разрешаются в претензионном порядке, а при недостижении согласия — в суде по месту нахождения Лицензиара.</P>
        </Section>

        <Section num="9" title="Реквизиты Лицензиара">
          <div className="rounded-2xl p-5 space-y-2.5 text-sm"
            style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}>
            {[
              ["Наименование", IP_FULL],
              ["ИНН", INN],
              ["ОГРНИП", OGRNIP],
              ["Адрес", ADDRESS],
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
          <p>EULA составлено в соответствии с гл. 70 ГК РФ и ФЗ-149 «Об информации».</p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {[
              { label: "Публичная оферта", to: "/public-offer" },
              { label: "Условия использования", to: "/terms" },
              { label: "Политика cookies", to: "/cookie-policy" },
              { label: "Политика конфиденциальности", to: "/privacy-policy" },
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
