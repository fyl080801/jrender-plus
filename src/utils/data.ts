import yaml from 'js-yaml'

export const fetchYaml = async (path) => {
  const response = await fetch(path)
  return yaml.load(await response.text())
}
