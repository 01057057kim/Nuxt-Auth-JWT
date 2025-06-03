<template>
    <div class="bg-orange-100 p-10 flex flex-col items-start justify-center">
        <h1 class="mb-4 text-2xl font-bold">Login</h1>
        <form action="" class="flex flex-col gap-4">
            <div>
                <label for="">Username: </label>
                <input type="text" placeholder="Input Username" class="border-2 p-2">
            </div>
            <div>
                <label for="">Password: </label>
                <input type="password" placeholder="Input Password" class="border-2 p-2">
            </div>
            <div class="flex gap-5">
                <button type="submit" class="border-2 p-2">Login</button>
                <NuxtLink to="/" class="border-2 p-2">Back</NuxtLink>
            </div>
        </form>
    </div>
</template>