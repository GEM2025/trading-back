// interfaces/planos - modelos de pura propiedad
export interface Car {
    color: string ;
    gas: 'gasoline' | 'electric' ;
    year: number ;
    price: number ;
    description: string ;
}