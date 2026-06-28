const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

const getCredentials = () => ({
  token: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
});

// Free-form text — solo funciona con el número sandbox de Meta (testing)
export const sendWhatsAppMessage = async (
  phone: string,
  message: string
): Promise<{ success: boolean; errorMsg?: string }> => {
  const { token, phoneNumberId } = getCredentials();
  if (!token || !phoneNumberId) {
    return { success: false, errorMsg: "WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados" };
  }

  const normalizedPhone = phone.replace(/\D/g, "");

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizedPhone,
        type: "text",
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, errorMsg: error?.error?.message ?? `HTTP ${response.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, errorMsg: err?.message ?? "Error desconocido" };
  }
};

export interface ITemplateParams {
  firstName: string;   // {{1}}
  date: string;        // {{2}} ej: "mié 17 de junio"
  time: string;        // {{3}} ej: "10:00"
  contactPhone: string;    // {{4}} teléfono fijo
  contactWhatsApp: string; // {{5}} número WA (sin +)
}

// Template aprobado por Meta — para producción
export const sendWhatsAppTemplate = async (
  phone: string,
  params: ITemplateParams
): Promise<{ success: boolean; errorMsg?: string }> => {
  const { token, phoneNumberId } = getCredentials();
  if (!token || !phoneNumberId) {
    return { success: false, errorMsg: "WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados" };
  }

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "recordatorio_de_clase";
  const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "es";
  const normalizedPhone = phone.replace(/\D/g, "");

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizedPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: params.firstName },
                { type: "text", text: params.date },
                { type: "text", text: params.time },
                { type: "text", text: params.contactPhone },
                { type: "text", text: params.contactWhatsApp },
              ],
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, errorMsg: error?.error?.message ?? `HTTP ${response.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, errorMsg: err?.message ?? "Error desconocido" };
  }
};
