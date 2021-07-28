import Layout from "@/components/Layout/Layout.vue";

export default function UnderMainentance() {
  return (
    <Layout header={false}>
      <div>
        <h1>Site is temporarily unavailable.</h1>
        <p>
          Scheduled maintenance is currently in progress. Please check back
          soon.
        </p>
        <p>We apologize for any inconvenience.</p>
      </div>
    </Layout>
  );
}
