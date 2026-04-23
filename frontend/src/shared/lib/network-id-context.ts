import type { Network } from 'common/schemas/network/index';
import { createContext } from 'svelte';


export const [getNetworkId, setNetworkId] = createContext<Network['id']>();