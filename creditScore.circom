pragma circom 2.0.0;

// 특정 지갑 주소의 신용 점수가 100 이상인지 검증
template CreditScore() {
    signal input walletAddress;       // 입력: 지갑 주소 (비공개)
    signal input creditScore;         // 입력: 신용 점수 (비공개)
    signal input expectedWalletAddress; // 입력: 예상 지갑 주소 (공개)

    signal output result;             // 출력: 검증 결과 (0 또는 1)

    // 지갑 주소와 예상 주소 비교
    component walletMatch = IsEqual();
    walletMatch.in[0] <== walletAddress;
    walletMatch.in[1] <== expectedWalletAddress;

    // 신용 점수가 100 이상인지 확인
    component creditValid = GreaterEqualThan(100);
    creditValid.in <== creditScore;

    // 결과: 두 조건이 모두 만족해야 함
    result <== walletMatch.out * creditValid.out;
}

component main = CreditScore();
