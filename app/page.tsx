import JobDetail from "@/models/job_detail.model";

export default async function Home() {
  try {
    const job = await JobDetail.findOne();
    console.log(job);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  return <h1>lmao</h1>;
}
