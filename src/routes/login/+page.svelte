<script lang="ts">
  import { enhance } from "$app/forms";
  import { Lock, LogIn, Mail } from "lucide-svelte";
  import type { PageProps } from "./$types";

  const { data, form }: PageProps = $props();
  let loading = $state(false);
  const error = $derived(form?.error);
</script>

<div
  class="fixed flex inset-0 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4"
>
  <div class="flex flex-col items-center w-full max-w-md">
    <h1
      class="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 mb-12 transform hover:scale-105 transition-all"
    >
      BandSpace
    </h1>

    <div
      class="w-full p-8 bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-600/50"
    >
      <h2 class="text-2xl font-bold text-center text-gray-200 mb-8">Log In</h2>

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
            class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
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
              class="block w-full pl-10 pr-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [&:-webkit-autofill]:bg-gray-800/70 [&:-webkit-autofill]:text-gray-300 [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(209_213_219)] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]"
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
              class="block w-full pl-10 pr-3 py-2 bg-gray-800/70 border border-gray-600/50 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <LogIn class="h-5 w-5 mr-2" />
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div class="mt-4">
          <button
            type="submit"
            formnovalidate
            formaction="?/googleLogin"
            class="w-full flex items-center justify-center px-4 py-2 border border-gray-600/50 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-gray-800/70 hover:bg-gray-700/70 transition-all"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              class="h-5 w-5 mr-2"
            />
            Log in with Google
          </button>
        </div>

        <p class="text-center text-sm text-gray-400 mt-4">
          No account? <a
            href="/signup"
            class="text-blue-400 hover:text-blue-300 transition-colors"
            >Sign up</a
          >
        </p>
      </form>
    </div>
  </div>
</div>
