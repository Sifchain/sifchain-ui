import { defineComponent } from "vue";

import ManageTokenListModal from "@/components/ManageTokenListModal";
import PageCard from "@/components/PageCard";

export default defineComponent({
  setup() {
    return () => <PageCard heading={<div></div>}></PageCard>;
  },
});
