import { Html, Head, Preview, Tailwind, Body, Container, Text, Button } from "@react-email/components";
import { emailStyles } from "./emailStyles";

interface RegisterEmailProps {
  verificationLink: string
}

export const RegisterEmail = ({
  verificationLink
}: RegisterEmailProps) => {
  const previewText = "Dokončete svou registraci na portálu EMM"

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
                zasíláme vám pozvánku k registraci do portálu EWE mobility management, která vám umožní
				snadný dohled a kontrolu nad vaší nabíjecí stanicí.
            </Text>

            <Button href={verificationLink} className={emailStyles.button}>
              Dokončit registraci
            </Button>

            <Text className={emailStyles.text}>
                V registraci pokračujte ověřením e-mailové adresy, vytvořením uživatelského účtu a vyplněním
				kontaktních údajů po kliknutí na tlačítko.
            </Text>
          </Container>
          <Text className={emailStyles.footerText}>© EWE s.r.o., Třebovská 570, 562 03 Ústí nad Orlicí</Text>
        </Body>
      </Tailwind>
    </Html>
  )
}