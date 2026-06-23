export const StatusOSValues = {
    RECEBIDA: 'RECEBIDA',
    EM_DIAGNOSTICO: 'EM DIAGNOSTICO',
    AGUARDANDO_APROVACAO: 'AGUARDANDO APROVACAO',
    EM_EXECUCAO: 'EM EXECUCAO',
    FINALIZADA: 'FINALIZADA',
    ENTREGUE: 'ENTREGUE',
} as const;

export type StatusOSValue = (typeof StatusOSValues)[keyof typeof StatusOSValues];

const TRANSITIONS: Record<StatusOSValue, StatusOSValue[]> = {
    RECEBIDA: [StatusOSValues.EM_DIAGNOSTICO],
    'EM DIAGNOSTICO': [StatusOSValues.AGUARDANDO_APROVACAO],
    'AGUARDANDO APROVACAO': [StatusOSValues.EM_EXECUCAO],
    'EM EXECUCAO': [StatusOSValues.FINALIZADA],
    FINALIZADA: [StatusOSValues.ENTREGUE],
    ENTREGUE: [],
};

export class StatusOS {
    private readonly _value: StatusOSValue;

    private constructor(value: StatusOSValue) {
        this._value = value;
    }

    static from(status: string): StatusOS {
        const normalized = status.trim().toUpperCase();
        const match = Object.values(StatusOSValues).find(
            (value) => value.toUpperCase() === normalized
        );

        if (!match) {
            throw new Error('Status inválido.');
        }

        return new StatusOS(match);
    }

    static recebida(): StatusOS {
        return new StatusOS(StatusOSValues.RECEBIDA);
    }

    static validateTransition(atual: StatusOS, novo: StatusOS): void {
        const permitidos = TRANSITIONS[atual.value] ?? [];

        if (!permitidos.includes(novo.value)) {
            throw new Error(`Não é permitido alterar status de ${atual.value} para ${novo.value}`);
        }
    }

    get value(): StatusOSValue {
        return this._value;
    }

    isEmDiagnostico(): boolean {
        return this._value === StatusOSValues.EM_DIAGNOSTICO;
    }
}
