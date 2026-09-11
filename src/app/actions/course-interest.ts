"use server";

import { createElement } from "react";
import { z } from "zod";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import { field, fieldErrors, gate, invalid, MSG, plainText, sendFailure, str, type FormState } from "@/lib/forms";
import { COURSES, optionLabel, optionValues } from "@/components/forms/options";
import { CourseInterestKristineEmail, courseInterestRows, type CourseInterestEmailData } from "@/emails/event-kristine";

const SUCCESS =
  "Tak for din interesse. Kristine skriver til dig inden for to hverdage, så I kan finde en dag, der passer.";

const schema = z.object({
  course: z.enum(optionValues(COURSES), { error: MSG.choose }),
  persons: field.count(1, "Skriv, hvor mange I er."),
  period: field.requiredText(200),
  name: field.name,
  email: field.email,
  phone: field.phone,
  message: field.text(),
});

export async function submitCourseInterest(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("kursus", formData, SUCCESS);
  if (gated) return gated;

  const parsed = schema.safeParse({
    course: str(formData, "course"),
    persons: str(formData, "persons"),
    period: str(formData, "period"),
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    message: str(formData, "message"),
  });
  if (!parsed.success) return invalid(fieldErrors(parsed.error), formData);

  const v = parsed.data;
  const data: CourseInterestEmailData = {
    course: optionLabel(COURSES, v.course),
    persons: v.persons,
    period: v.period,
    name: v.name,
    email: v.email,
    phone: v.phone,
    message: v.message,
  };

  const sent = await sendEmail({
    to: EMAIL_TO,
    subject: `Interesse i kursus: ${data.course}, ${v.name}`,
    react: createElement(CourseInterestKristineEmail, { data }),
    text: plainText("Interesse i et kursus", courseInterestRows(data)),
    replyTo: v.email,
  });
  if (!sent.ok) {
    console.error("[course-interest] kunne ikke sende til Kristine:", sent.error);
    return sendFailure(formData);
  }

  return { ok: true, message: SUCCESS };
}
