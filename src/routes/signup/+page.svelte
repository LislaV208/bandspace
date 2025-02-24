<script lang="ts">
  import { Mail, Lock, UserPlus } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  
  let email = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  let errorMsg = '';
  let successMsg = '';

  async function handleSignup() {
    loading = true;
    errorMsg = '';
    successMsg = '';

    if (password !== confirmPassword) {
      errorMsg = 'Passwords do not match';
      loading = false;
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;
      
      goto('/login?message=Registration successful! Please check your email to confirm your account.');
      return;
    } catch (error) {
        errorMsg = error instanceof Error ? error.message : 'An error occurred during login';
    } finally {
      loading = false;
    }
  }
</script>

<div class="fixed inset-0 flex items-center justify-center bg-gray-900 overflow-hidden">
  <div class="w-full max-w-md p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white">Create Account</h1>
    </div>

    <form on:submit|preventDefault={handleSignup} class="space-y-6">
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
            placeholder="Create a password"
          />
        </div>
      </div>

      <div>
        <label for="confirm-password" class="block text-sm font-medium text-gray-300">Confirm Password</label>
        <div class="mt-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock class="h-5 w-5 text-gray-500" />
          </div>
          <input
            id="confirm-password"
            type="password"
            bind:value={confirmPassword}
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
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>

      <p class="text-center text-sm text-gray-500 mt-4">
        Already have an account? <a href="/login" class="text-green-500 hover:text-green-400">Log in</a>
      </p>
    </form>
  </div>
</div>