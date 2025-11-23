import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // إنشاء المستخدم
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: fullName, role: "admin" },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // إنشاء profile مع role = admin
    if (data.user) {
      console.log("Creating profile for user")
      
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: data.user.id,
          name: fullName,
          role: "admin",
        })
        .select()

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      console.log("Profile created")
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
