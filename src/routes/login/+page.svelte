<script lang="ts">
  import { Mail, Lock, LogIn } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  let email = '';
  let password = '';
  let loading = false;
  let errorMsg = '';
  let successMsg = '';

  onMount(() => {
    const message = $page.url.searchParams.get('message');
    if (message) {
      successMsg = message;
      setTimeout(() => successMsg = '', 5000);
    }
  });

  async function handleLogin() {
    loading = true;
    errorMsg = '';
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      goto('/projects');
    } catch (error) {
      errorMsg = error instanceof Error ? error.message : 'An error occurred during login';
    } finally {
      loading = false;
    }
  }

  async function handleGoogleLogin() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/projects`
        }
      });

      if (error) throw error;
    } catch (error) {
      errorMsg = error instanceof Error ? error.message : 'An error occurred during Google login';
    }
  }
</script>

<div class="fixed inset-0 flex items-center justify-center bg-gray-900 overflow-hidden">
  <div class="w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white">BandSpace</h1>
    </div>

    <form on:submit|preventDefault={handleLogin} class="space-y-6">
      {#if errorMsg}
        <div class="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
          {errorMsg}
        </div>
      {/if}

      {#if successMsg}
        <div class="p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded text-green-500 text-sm">
          {successMsg}
        </div>
      {/if}

      <div>
        <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
        <div class="mt-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail class="h-5 w-5 text-gray-500" />
          </div>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
        <div class="mt-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock class="h-5 w-5 text-gray-500" />
          </div>
          <input
            id="password"
            type="password"
            bind:value={password}
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
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <div class="mt-4">
        <button
          type="button"
          on:click={handleGoogleLogin}
          class="w-full flex items-center justify-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" class="h-5 w-5 mr-2" />
          Log in with Google
        </button>
      </div>

      <p class="text-center text-sm text-gray-500 mt-4">
        No account? <a href="/signup" class="text-green-500 hover:text-green-400">Sign up</a>
      </p>
    </form>
  </div>
</div>