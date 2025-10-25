import { NextResponse } from "next/server";
import JobDetail from "@/models/JobDetail";
import connectDb from "@/app/lib/db";

export async function PUT(request, { params }) {
  try {
    await connectDb();
    const { id } = params;
    const body = await request.json();

    // Tìm và cập nhật công việc
    const updatedJob = await JobDetail.findByIdAndUpdate(
      id,
      {
        $set: {
          url: body.url,
          thumbnail: body.thumbnail,
          job_title: body.job_title,
          company_url: body.company_url,
          company_name: body.company_name,
          province: body.province,
          salary: body.salary,
          skills: body.skills,
          descriptions: body.descriptions,
          job_info: body.job_info,
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công việc" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Cập nhật công việc thành công",
      data: updatedJob
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Không thể cập nhật công việc: " + error.message
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDb();
    const { id } = params;

    // Tìm và xóa công việc
    const deletedJob = await JobDetail.findByIdAndDelete(id);

    if (!deletedJob) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công việc" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Xóa công việc thành công"
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Không thể xóa công việc: " + error.message
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    await connectDb();
    const { id } = params;

    // Tìm công việc theo ID
    const job = await JobDetail.findById(id);

    if (!job) {
      return NextResponse.json({ 
        success: false, 
        error: "Không tìm thấy công việc" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: job
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Không thể lấy thông tin công việc: " + error.message
    }, { status: 500 });
  }
}
