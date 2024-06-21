import { Html, Head, Preview, Tailwind, Body, Container, Text, Button, Link } from "@react-email/components";
import { emailStyles } from "./emailStyles";

interface ResetEmailProps {
  email: string;
  verificationLink: string
}

export const ResetEmail = ({
  email,
  verificationLink
}: ResetEmailProps) => {
  const previewText = "Resetujte své heslo na portálu EEM"

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: emailStyles.colors
            }
          }
        }}
      >
        <Body className={emailStyles.body}>
          <Container className={emailStyles.container}>
            <Text className={emailStyles.text}>Dobrý den,</Text>
            <Text className={emailStyles.text}>
              obdrželi jsme žádost o resetování hesla k účtu spojeným s emailem {email}
            </Text>

            <Button href={verificationLink} className={emailStyles.button}>
              Resetujte své heslo
            </Button>

            <Text className={emailStyles.text}>
              Pokud jste tuto žádost nepodali nebo máte potíže s přihlášením, kontaktujte nás prostřednictvím <Link href="#" className="text-primary font-semibold">naší stránky podpory</Link>.
              Ve vašem účtu nebyly provedeny žádné změny.
            </Text>
          </Container>
          <Text className={emailStyles.footerText}>© EWE s.r.o., Třebovská 570, 562 03 Ústí nad Orlicí</Text>
        </Body>
      </Tailwind>
    </Html>
  )
}