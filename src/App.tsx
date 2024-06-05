import './App.css'
import { toast } from 'react-toastify'
import { useEffect, useRef, useState } from 'react'
import axios, { AxiosError } from 'axios'

// ЗАДАЧА:
// Создать мини-приложение, где есть форма, в которой
// текстовый инпут и селект.
// Из селекта можно выбрать тип: "user" или "repo".
//
// В зависимости от того, что выбрано в селекте,
// при отправке формы приложение делает запрос
// на один из следующих эндпоинтов:
//
// https://api.github.com/users/${nickname}
// пример значений: defunkt, ktsn, jjenzz, ChALkeR, Haroenv
//
// https://api.github.com/repos/${repo}
// пример значений: nodejs/node, radix-ui/primitives, sveltejs/svelte
//
// после чего, в списке ниже выводится полученная информация;
// - если это юзер, то его full name и число репозиториев; name && public_repos
// - если это репозиторий, то его название и число звезд. name && stargazers_count

// ТРЕБОВАНИЯ К ВЫПОЛНЕНИЮ:
// - Типизация всех элементов.
// - Выполнение всего задания в одном файле App.tsx, НО с дроблением на компоненты.
// - Стилизовать или использовать UI-киты не нужно. В задаче важно правильно выстроить логику и смоделировать данные.
// - Задание требуется выполнить максимально правильным образом, как если бы вам нужно было, чтобы оно прошло код ревью и попало в продакшн.

// Все вопросы по заданию и результаты его выполнения присылать сюда - https://t.me/temamint

interface IUserResponse {
	name: string
	public_repos: number
}

interface IRepoResponse {
	name: string
	stargazers_count: number
}

const baseUrl = 'https://api.github.com'

export function App() {
	const [url, setUrl] = useState(baseUrl)
	const isFirstRender = useRef(true)
	const [dataList, setDataList] = useState<IUserResponse | IRepoResponse>(
		{} as IUserResponse | IRepoResponse
	)

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}

		const fetchData = async () => {
			try {
				const { data } = await axios.get<IUserResponse | IRepoResponse>(url)
				setDataList(data)
			} catch (error) {
				toast.error((error as AxiosError<{ message: string }>).response?.data.message)
			}
		}
		fetchData()
	}, [url])

	const onSubmit = ({ repoName, userName, selectValue }: TypeSubmitProps) => {
		const url =
			selectValue === 'user'
				? `${baseUrl}/users/${userName}`
				: `${baseUrl}/repos/${userName}/${repoName}`

		setUrl(url)
	}

	return (
		<section>
			<Form onSubmit={onSubmit} />
			<DataList dataList={dataList} />
		</section>
	)
}

type TypeSubmitProps = { userName: string; repoName: string; selectValue: string }
type TypeProps = {
	onSubmit: ({ userName, repoName, selectValue }: TypeSubmitProps) => void
}

export function Form({ onSubmit }: TypeProps) {
	const [selectValue, setSelectValue] = useState('user')
	const [userName, setUserName] = useState('')
	const [repoName, setRepoName] = useState('')

	const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectValue(e.target.value)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		onSubmit({ userName, repoName, selectValue })
	}

	return (
		<form onSubmit={handleSubmit}>
			<select name='type' title='Что ищем?' onChange={onSelect} defaultValue={EnumSelect.user}>
				<option value='user'>user</option>
				<option value='repo'>repo</option>
			</select>
			<input
				type={EnumSelect.user}
				name={EnumSelect.user}
				placeholder={EnumSelect.user}
				required
				value={userName}
				onChange={(e) => setUserName(e.target.value)}
			/>
			<input
				type={EnumSelect.repo}
				name={EnumSelect.repo}
				placeholder={EnumSelect.repo}
				required={selectValue === EnumSelect.repo}
				value={repoName}
				onChange={(e) => setRepoName(e.target.value)}
				disabled={selectValue === EnumSelect.user}
			/>
			<button type='submit'>Search</button>
		</form>
	)
}

enum EnumSelect {
	user = 'user',
	repo = 'repo',
}

type TypeDataListProps = { dataList: IUserResponse | IRepoResponse }

const isUserResponse = (data: IUserResponse | IRepoResponse): data is IUserResponse => {
	return (data as IUserResponse).public_repos !== undefined
}

export function DataList({ dataList }: TypeDataListProps) {
	return isUserResponse(dataList) ? (
		<section>
			<p>Имя: {dataList?.name}</p>
			<p>Кол-во репозиториев: {dataList?.public_repos}</p>
		</section>
	) : (
		<section>
			<p>Имя репы: {dataList?.name}</p>
			<p>Звёзд: {dataList?.stargazers_count}</p>
		</section>
	)
}
