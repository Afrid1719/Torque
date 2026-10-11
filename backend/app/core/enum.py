from enum import StrEnum

class VehicleTypeEnum(StrEnum):
    PRIVATE = "private"
    COMMERCIAL = "commercial"

class FuelTypeEnum(StrEnum):
    PETROL = "petrol"
    DIESEL = "diesel"
    EV = "ev"
    CNG = "cng"
    HYBRID = "hybrid"

class TransmissionEnum(StrEnum):
    MANUAL = "manual"
    SEMI_AUTOMATIC = "semi_automatic"
    AUTOMATIC = "automatic"