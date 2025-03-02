<script lang="ts">
  import { enhance } from "$app/forms";
  import { Lock, LogIn, Mail } from "lucide-svelte";
  import type { PageProps } from "./$types";

  const { data, form }: PageProps = $props();

  // $inspect(data);
  // $inspect(form);

  let loading = $state(false);

  const error = $derived(form?.error);
</script>

<div
  class="fixed inset-0 flex items-center justify-center bg-gray-900 overflow-hidden"
>
  <div class="w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white">BandSpace</h1>
    </div>

    <form
      method="POST"
      action="?/login"
      class="space-y-6"
      use:enhance={() => {
        loading = true;

        return async ({ result, update }) => {
          loading = false;

          await update();
        };
      }}
    >
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
            placeholder="Enter your password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogIn class="h-5 w-5 mr-2" />
        {loading ? "Logging in..." : "Log In"}
      </button>

      <div class="mt-4">
        <button
          type="submit"
          formnovalidate
          formaction="?/googleLogin"
          class="w-full flex items-center justify-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            class="h-5 w-5 mr-2"
          />
          Log in with Google
        </button>
      </div>

      <p class="text-center text-sm text-gray-500 mt-4">
        No account? <a
          href="/signup"
          class="text-green-500 hover:text-green-400">Sign up</a
        >
      </p>
    </form>
  </div>
</div>
