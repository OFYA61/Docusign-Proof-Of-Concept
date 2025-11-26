<script>
  import Home from './routes/Home.svelte';
  import CreateOffer from './routes/CreateOffer.svelte';
  import ViewOffers from './routes/ViewOffers.svelte';
  import ViewOfferDetails from './routes/ViewOfferDetails.svelte';

  let currentRoute = 'home';
  let routeParams = null;

  function navigate(route, params = null) {
    currentRoute = route;
    routeParams = params;
  }
</script>

{#if currentRoute === 'home'}
  <Home onNavigate={navigate} />
{:else if currentRoute === 'create-offer'}
  <CreateOffer onNavigate={navigate} />
{:else if currentRoute === 'view-offers'}
  <ViewOffers onNavigate={navigate} />
{:else if currentRoute === 'view-offer-details'}
  <ViewOfferDetails onNavigate={navigate} envelopeId={routeParams} />
{/if}
