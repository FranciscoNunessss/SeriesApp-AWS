class ResourceNotFoundError(Exception):
    def __init__(self, resource: str, resource_id: int):
        self.resource = resource
        self.resource_id = resource_id
        super().__init__(f"{resource} with id {resource_id} not found")


class DuplicateResourceError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)