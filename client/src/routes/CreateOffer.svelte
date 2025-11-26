<script>
  export let onNavigate;

  let signers = [{ email: "", name: "" }];
  let products = [""];
  let ccUsers = [];
  let errorMessage = "";
  let successMessage = "";
  let isSubmitting = false;

  function addSigner() {
    signers = [...signers, { email: "", name: "" }];
  }

  function removeSigner(index) {
    if (signers.length > 1) {
      signers = signers.filter((_, i) => i !== index);
    }
  }

  function addProduct() {
    products = [...products, ""];
  }

  function removeProduct(index) {
    if (products.length > 1) {
      products = products.filter((_, i) => i !== index);
    }
  }

  function addCcUser() {
    ccUsers = [...ccUsers, { email: "", name: "" }];
  }

  function removeCcUser(index) {
    ccUsers = ccUsers.filter((_, i) => i !== index);
  }

  async function handleSubmit() {
    errorMessage = "";
    successMessage = "";

    // Validation
    if (
      signers.length === 0 ||
      signers.some((s) => !s.email.trim() || !s.name.trim())
    ) {
      errorMessage = "All signers must have both email and name filled out.";
      return;
    }

    if (products.length === 0 || products.some((p) => !p.trim())) {
      errorMessage = "All product fields must be filled out.";
      return;
    }

    if (ccUsers.some((cc) => !cc.email.trim() || !cc.name.trim())) {
      errorMessage = "All CC users must have both email and name filled out.";
      return;
    }

    const payload = {
      signers: signers.map((s) => ({
        email: s.email.trim(),
        name: s.name.trim(),
      })),
      products: products.map((p) => p.trim()),
      cc_users: ccUsers.map((cc) => ({
        email: cc.email.trim(),
        name: cc.name.trim(),
      })),
    };

    isSubmitting = true;

    try {
      const response = await fetch("http://localhost:3000/send-envelope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        successMessage = "Offer created successfully!";
        // Reset form
        signers = [{ email: "", name: "" }];
        products = [""];
        ccUsers = [];
      } else {
        const error = await response.json();
        errorMessage = `Error: ${error.message || "Failed to create offer"}`;
      }
    } catch (error) {
      errorMessage = `Network error: ${error.message}`;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="container py-4">
  <div class="row">
    <div class="col-lg-8 mx-auto">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Create New Offer</h2>
        <button
          class="btn btn-outline-secondary"
          onclick={() => onNavigate("home")}
        >
          Back to Home
        </button>
      </div>

      {#if errorMessage}
        <div
          class="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {errorMessage}
          <button
            type="button"
            class="btn-close"
            onclick={() => (errorMessage = "")}>{errorMessage}</button
          >
        </div>
      {/if}

      {#if successMessage}
        <div
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {successMessage}
          <button
            type="button"
            class="btn-close"
            onclick={() => (successMessage = "")}>{successMessage}</button
          >
        </div>
      {/if}

      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <!-- Signers Section -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              Signers <span class="badge bg-light text-dark"
                >{signers.length}</span
              >
            </h5>
          </div>
          <div class="card-body">
            {#each signers as signer, index}
              <div class="row g-3 mb-3">
                <div class="col-md-5">
                  <label for="signer-name-{index}" class="form-label"
                    >Name</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="signer-name-{index}"
                    bind:value={signer.name}
                    placeholder="Enter signer name"
                    required
                  />
                </div>
                <div class="col-md-5">
                  <label for="signer-email-{index}" class="form-label"
                    >Email</label
                  >
                  <input
                    type="email"
                    class="form-control"
                    id="signer-email-{index}"
                    bind:value={signer.email}
                    placeholder="Enter signer email"
                    required
                  />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    onclick={() => removeSigner(index)}
                    disabled={signers.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            {/each}
            <button
              type="button"
              class="btn btn-outline-primary"
              onclick={addSigner}
            >
              + Add Signer
            </button>
          </div>
        </div>

        <!-- Products Section -->
        <div class="card mb-4">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              Products <span class="badge bg-light text-dark"
                >{products.length}</span
              >
            </h5>
          </div>
          <div class="card-body">
            {#each products as product, index}
              <div class="row g-3 mb-3">
                <div class="col-md-10">
                  <label for="product-{index}" class="form-label"
                    >Product {index + 1}</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="product-{index}"
                    bind:value={products[index]}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    onclick={() => removeProduct(index)}
                    disabled={products.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            {/each}
            <button
              type="button"
              class="btn btn-outline-success"
              onclick={addProduct}
            >
              + Add Product
            </button>
          </div>
        </div>

        <!-- CC Users Section -->
        <div class="card mb-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">
              CC Users (Optional) <span class="badge bg-light text-dark"
                >{ccUsers.length}</span
              >
            </h5>
          </div>
          <div class="card-body">
            {#if ccUsers.length === 0}
              <p class="text-muted">No CC users added yet.</p>
            {/if}
            {#each ccUsers as ccUser, index}
              <div class="row g-3 mb-3">
                <div class="col-md-5">
                  <label for="cc-name-{index}" class="form-label">Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="cc-name-{index}"
                    bind:value={ccUser.name}
                    placeholder="Enter CC user name"
                  />
                </div>
                <div class="col-md-5">
                  <label for="cc-email-{index}" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="cc-email-{index}"
                    bind:value={ccUser.email}
                    placeholder="Enter CC user email"
                  />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    onclick={() => removeCcUser(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            {/each}
            <button
              type="button"
              class="btn btn-outline-info"
              onclick={addCcUser}
            >
              + Add CC User
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="d-grid">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Offer..." : "Create Offer"}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
