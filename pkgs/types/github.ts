export type GithubRepoId = string & { __brand: 'GithubRepoId' }

export type GithubRepoInfo = {
    id: GithubRepoId

    name: string

    url: string
}
