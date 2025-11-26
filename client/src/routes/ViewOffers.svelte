<script>
  export let onNavigate;

  let envelopes = {};
  let isLoading = true;
  let errorMessage = "";

  async function fetchEnvelopes() {
    isLoading = true;
    errorMessage = "";

    try {
      const response = await fetch("http://localhost:3000/sent-envelopes");

      if (response.ok) {
        envelopes = await response.json();
      } else {
        const error = await response.json();
        errorMessage = `Error: ${error.message || "Failed to fetch envelopes"}`;
      }
    } catch (error) {
      errorMessage = `Network error: ${error.message}`;
    } finally {
      isLoading = false;
    }
  }

  fetchEnvelopes();

  $: envelopeIds = Object.keys(envelopes);
</script>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Sent Offers</h2>
    <button class="btn btn-outline-secondary" onclick={() => onNavigate("home")}>
      Back to Home
    </button>
  </div>

  {#if errorMessage}
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      {errorMessage}
      <button
        type="button"
        class="btn-close"
        onclick={() => (errorMessage = "")}
      ></button>
    </div>
  {/if}

  {#if isLoading}
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading sent offers...</p>
    </div>
  {:else if envelopeIds.length === 0}
    <div class="alert alert-info" role="alert">
      No sent offers found. Create your first offer to get started!
    </div>
    <button
      class="btn btn-primary"
      onclick={() => onNavigate("create-offer")}
    >
      Create New Offer
    </button>
  {:else}
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          All Offers
          <span class="badge bg-light text-dark">{envelopeIds.length}</span>
        </h5>
      </div>
      <div class="list-group list-group-flush">
        {#each envelopeIds as envelopeId}
          <div
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <h6 class="mb-1">Envelope ID</h6>
              <code class="text-muted">{envelopeId}</code>
            </div>
            <button
              class="btn btn-outline-primary"
              onclick={() => onNavigate("view-offer-details", envelopeId)}
            >
              View Details
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
