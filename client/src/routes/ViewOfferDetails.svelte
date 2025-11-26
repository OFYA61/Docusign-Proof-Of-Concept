<script>
  export let onNavigate;
  export let envelopeId;

  let envelopeData = null;
  let isLoading = true;
  let errorMessage = "";

  async function fetchEnvelopeDetails() {
    isLoading = true;
    errorMessage = "";

    try {
      const response = await fetch(
        `http://localhost:3000/sent-envelopes/${envelopeId}`
      );

      if (response.ok) {
        envelopeData = await response.json();
      } else {
        const error = await response.json();
        errorMessage = `Error: ${error.message || "Failed to fetch envelope details"}`;
      }
    } catch (error) {
      errorMessage = `Network error: ${error.message}`;
    } finally {
      isLoading = false;
    }
  }

  fetchEnvelopeDetails();

  function getStatusBadgeClass(status) {
    const statusMap = {
      PENDING: "bg-secondary",
      SENT: "bg-primary",
      DELIVERED: "bg-info",
      OPENED: "bg-warning text-dark",
      COMPLETE: "bg-success",
    };
    return statusMap[status] || "bg-secondary";
  }

  function getEnvelopeStatusBadgeClass(status) {
    return status === "COMPLETE" ? "bg-success" : "bg-primary";
  }
</script>

<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Offer Details</h2>
    <div class="btn-group">
      <button
        class="btn btn-outline-primary"
        onclick={fetchEnvelopeDetails}
        disabled={isLoading}
      >
        {#if isLoading}
          <span class="spinner-border spinner-border-sm me-1" role="status"></span>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-arrow-clockwise me-1"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
            />
            <path
              d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"
            />
          </svg>
        {/if}
        Refresh
      </button>
      <button
        class="btn btn-outline-secondary"
        onclick={() => onNavigate("view-offers")}
      >
        Back to List
      </button>
      <button
        class="btn btn-outline-secondary"
        onclick={() => onNavigate("home")}
      >
        Home
      </button>
    </div>
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
    <button class="btn btn-primary" onclick={() => onNavigate("view-offers")}>
      Back to Offers List
    </button>
  {:else if isLoading}
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading envelope details...</p>
    </div>
  {:else if envelopeData}
    <div class="row">
      <div class="col-12">
        <!-- Envelope Info Card -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Envelope Information</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="text-muted mb-1">Envelope ID</h6>
                <code class="fs-6">{envelopeData.envelopeId}</code>
              </div>
              <div class="col-md-6 text-md-end">
                <h6 class="text-muted mb-1">Status</h6>
                <span
                  class="badge {getEnvelopeStatusBadgeClass(
                    envelopeData.status
                  )} fs-6"
                >
                  {envelopeData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Signatures Card -->
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              Signatures
              <span class="badge bg-light text-dark">
                {envelopeData.signatures.length}
              </span>
            </h5>
          </div>
          <div class="card-body">
            {#if envelopeData.signatures.length === 0}
              <p class="text-muted mb-0">No signatures found.</p>
            {:else}
              <div class="list-group">
                {#each envelopeData.signatures as signature, index}
                  <div class="list-group-item">
                    <div
                      class="d-flex justify-content-between align-items-start"
                    >
                      <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                          <h6 class="mb-0 me-3">Signer {index + 1}</h6>
                          <span
                            class="badge {getStatusBadgeClass(
                              signature.status
                            )}"
                          >
                            {signature.status}
                          </span>
                        </div>
                        <div class="mb-1">
                          <strong>Name:</strong>
                          {signature.user.name}
                        </div>
                        <div class="text-muted">
                          <strong>Email:</strong>
                          {signature.user.email}
                        </div>
                      </div>
                      <div class="text-end">
                        {#if signature.status === "COMPLETE"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            fill="currentColor"
                            class="bi bi-check-circle-fill text-success"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                            />
                          </svg>
                        {:else if signature.status === "PENDING"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            fill="currentColor"
                            class="bi bi-clock text-secondary"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
                            />
                            <path
                              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"
                            />
                          </svg>
                        {:else}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            fill="currentColor"
                            class="bi bi-envelope-open text-primary"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M8.47 1.318a1 1 0 0 0-.94 0l-6 3.2A1 1 0 0 0 1 5.4v.817l5.75 3.45L8 8.917l1.25.75L15 6.217V5.4a1 1 0 0 0-.53-.882l-6-3.2zM15 7.383l-4.778 2.867L15 13.117V7.383zm-.035 6.88L8 10.082l-6.965 4.18A1 1 0 0 0 2 15h12a1 1 0 0 0 .965-.738zM1 13.116l4.778-2.867L1 7.383v5.734zM7.059.435a2 2 0 0 1 1.882 0l6 3.2A2 2 0 0 1 16 5.4V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5.4a2 2 0 0 1 1.059-1.765l6-3.2z"
                            />
                          </svg>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
