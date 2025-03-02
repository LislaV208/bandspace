<script lang="ts">
  import { Lock, Mail, UserPlus } from "lucide-svelte";
  import type { PageProps } from "./$types";

  const { form }: PageProps = $props();
  const error = $derived(form?.error);

  let loading = $state(false);
</script>

<div
  class="fixed inset-0 flex items-center justify-center bg-gray-900 overflow-hidden"
>
  <div class="w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white">Create Account</h1>
    </div>

    <form method="post" class="space-y-6">
      {#if error}
        <div
          class="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm"
        >
          {error}
        </div>
      {/if}

      <div>
        <label for="email" class="block text-sm font-medium text-gray-300"
          >Email</label
        >
        <div class="mt-1 relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <Mail class="h-5 w-5 text-gray-500" />
          </div>
          <input
            id="email"
            type="email"
            name="email"
            required
            class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-300"
          >Password</label
        >
        <div class="mt-1 relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <Lock class="h-5 w-5 text-gray-500" />
          </div>
          <input
            id="password"
            type="password"
            name="password"
            required
            class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Create a password"
          />
        </div>
      </div>

      <div>
        <label
          for="confirm-password"
          class="block text-sm font-medium text-gray-300"
          >Confirm Password</label
        >
        <div class="mt-1 relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <Lock class="h-5 w-5 text-gray-500" />
          </div>
          <input
            id="confirm-password"
            type="password"
            name="confirm-password"
            required
            class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Confirm your password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus class="h-5 w-5 mr-2" />
        {loading ? "Creating Account..." : "Sign Up"}
      </button>

      <p class="text-center text-sm text-gray-500 mt-4">
        Already have an account? <a
          href="/login"
          class="text-green-500 hover:text-green-400">Log in</a
        >
      </p>
    </form>
  </div>
</div>
