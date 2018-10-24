export const environment = {
  production: true,
  host: location.origin + '/staff',
  vlabsHost: location.origin + '/vlabs',
  collaboratorsRepository: location.origin.replace(location.origin.substr(location.origin.lastIndexOf(':') + 1), '8000')
};