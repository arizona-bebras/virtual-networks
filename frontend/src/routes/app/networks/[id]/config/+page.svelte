<script lang="ts">
import { page } from "$app/state";
import NetworkConfigPage from "$pages/app/network-config/ui/page.svelte";
</script>

<NetworkConfigPage networkId={page.params.id ?? ""} />
