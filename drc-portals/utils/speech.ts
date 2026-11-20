export const speechMapper: Record<string, string> = {
  LYNX: "LINCS",
  Lynx: "LINCS",
  Winks: "LINCS",
  links: "LINCS",
  Links: "LINCS",
  "links DCC": "LINCS DCC",
  MotorPak: "MoTrPAC",
  Spark: "SPARC",
  glycoscience: "Glycoscience",
  "bridge to AI": "Bridge2AI",
  "g-tex": "GTEx",
  "g-tax": "GTEx",
  "hub map": "HuBMAP",
  HubMap: "HuBMAP",
  sennet: "SenNet",
  Sennet: "SenNet",
  CNET: "SenNet",
  "AT&T": "A2CPS",
};

// Corrects commonly misheard DCC names in transcribed speech
export function applySpeechMapper(text: string): string {
  Object.keys(speechMapper).forEach((key) => {
    const regex = new RegExp(`(${key})(?=[,?. ]|$)`, "gi");
    text = text.replace(regex, speechMapper[key]);
  });
  return text;
}
