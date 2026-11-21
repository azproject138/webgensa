import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/session";
import { ContactRepository } from "@/repositories/contact.repository";

export const runtime = "nodejs";

async function requireAdmin(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return admin;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const repository = new ContactRepository();
    const contact = await repository.findOne();
    if (!contact) {
      return NextResponse.json({ error: "Data kontak tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ contact });
  } catch (error) {
    console.error("[Contact GET] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { address, location_description, whatsapp, email, instagram, facebook, twitter } = body;

    const repository = new ContactRepository();
    await repository.update({
      address,
      location_description,
      whatsapp,
      email,
      instagram,
      facebook,
      twitter,
      updated_by: admin.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact PUT] Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
