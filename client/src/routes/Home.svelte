<script>
  export let onNavigate;
</script>

<div class="container py-5">
  <div class="text-center">
    <h1 class="display-3 mb-4">DocuSign Proof of Concept</h1>
    <p class="lead mb-4">Create and manage digital signature offers</p>

    <div class="d-grid gap-3 col-6 mx-auto">
      <button class="btn btn-primary btn-lg" onclick={() => onNavigate('create-offer')}>
        Create New Offer
      </button>
      <button class="btn btn-outline-primary btn-lg" onclick={() => onNavigate('view-offers')}>
        View Sent Offers
      </button>
    </div>
  </div>
</div>
