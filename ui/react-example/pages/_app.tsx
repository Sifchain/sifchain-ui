import type { AppProps } from "next/app";
import { SifchainProvider } from "ui-core/lib/react/v1";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SifchainProvider environment="devnet">
      <Component {...pageProps} />
    </SifchainProvider>
  );
}
export default MyApp;
