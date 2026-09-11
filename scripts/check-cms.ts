/**
 * Smoke test for the CMS façade without Sanity: prints where the content
 * comes from, the section types of the forside, and a count per document.
 *
 *   npx tsx scripts/check-cms.ts
 */
import {
  cmsSource,
  getCakes,
  getFaq,
  getInstagramImages,
  getLocations,
  getNavigation,
  getPage,
  getPages,
  getPizzaSettings,
  getProducts,
  getShopSettings,
  getSiteSettings,
} from "../src/lib/cms";

async function main() {
  console.log(`kilde: ${cmsSource}`);

  const forside = await getPage("forside");
  if (!forside) throw new Error("getPage('forside') returnerede null");
  console.log(`forside (${forside.title}): ${forside.sections.map((s) => s._type).join(", ")}`);

  for (const page of await getPages()) {
    const full = await getPage(page.slug);
    console.log(`  /${page.slug === "forside" ? "" : page.slug}: ${full?.sections.length ?? 0} afsnit${page.showInNav ? ", i menuen" : ""}`);
  }

  const site = await getSiteSettings();
  console.log(`indstillinger: ${site.name}, ${site.phone} (${site.phoneHref}), logo ${site.logo?.src ?? "mangler"}`);
  console.log(`steder: ${(await getLocations()).map((l) => `${l.name} (${l.hours.length} tider)`).join("; ")}`);
  console.log(`bageri: afhentning ${(await getShopSettings()).pickupDays.join(", ")}`);
  console.log(`pizzavogn: ${(await getPizzaSettings()).pizzas.length} pizzaer`);
  console.log(`varer: ${(await getProducts()).length}, kager: ${(await getCakes()).length}, spørgsmål: ${(await getFaq()).length}, instagram: ${(await getInstagramImages()).length}`);
  console.log(`menu: ${(await getNavigation()).map((n) => `${n.label} ${n.href}`).join(" | ")}`);

  const faq = (await getFaq())[0];
  console.log(`første svar som Portable Text: ${faq.answer.length} blok(ke), første tekst: "${faq.a.slice(0, 40)}..."`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
