import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const { admin, session } = await authenticate.admin(request);
  const carrier_service = new admin.rest.resources.CarrierService({session: session});
  carrier_service.name = "Sendflex Shipping Rate";
  carrier_service.callback_url = "https://brainboxinfoway.in/nrs/sendflex.php";
  carrier_service.service_discovery = true;
  await carrier_service.save({
    update: true,
    });

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" , carrier_service });
};

export default function App() {
  const { apiKey , carrier_service } = useLoaderData();
  console.log(carrier_service)

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
