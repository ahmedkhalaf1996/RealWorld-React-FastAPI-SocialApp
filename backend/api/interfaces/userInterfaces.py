from pydantic import BaseModel, EmailStr

class CraeteUser(BaseModel):
    firstName: str 
    lastName: str
    email:EmailStr
    password: str

class LoginUser(BaseModel):
    email:str
    password: str

class UpdateUserInterface(BaseModel):
    name: str 
    bio:str 
    imageUrl:str
