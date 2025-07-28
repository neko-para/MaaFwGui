import type { GithubRepoId, GithubRepoInfo } from '@mfg/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export const githubRepoInfo = ref<GithubRepoInfo[]>([])

export async function syncRepos() {
    githubRepoInfo.value = await window.main.github.queryRepo()
}

export async function requestNewRepo(url: string) {
    await window.main.github.newRepo(url)
    await syncRepos()
}

export async function requestDelRepo(id: GithubRepoId) {
    await window.main.github.delRepo(id)
    await syncRepos()
}

export async function requestCheckRepoUpdate(id: GithubRepoId) {
    await window.main.github.checkRepoUpdate(id)
    await syncRepos()
}

export function useGithubRepo() {
    const route = useRoute()

    const githubRepoId = computed(() => route.params.github_repo_id as GithubRepoId | undefined)

    const activeGithubRepoInfo = computed(() =>
        githubRepoInfo.value.find(x => x.id === githubRepoId.value)
    )

    return {
        githubRepoId,
        activeGithubRepoInfo
    }
}
